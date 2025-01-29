package controller

import (
	"context"
	"fmt"
	"log"
	"platform/pkg/client"
	"platform/pkg/utils"
	"time"

	"github.com/gorilla/websocket"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type Controller struct {
	User      string
	UserID    string
	Token     string
	Task      string
	Namespace string
	ExpiredAt string
}

type StatusMessage struct {
	Name        string    `json:"name,omitempty"`
	Uri         string    `json:"uri,omitempty"`
	Status      string    `json:"status,omitempty"`
	Description string    `json:"description,omitempty"`
	Ingress     []Ingress `json:"ingress,omitempty"`
	Auth        []Auth    `json:"auth,omitempty"`
	ExpiredAt   string    `json:"expired_at,omitempty"`
}

type Ingress struct {
	Name string `json:"name,omitempty"`
	Url  string `json:"url,omitempty"`
}

type Auth struct {
	Name  string `json:"name,omitempty"`
	Value string `json:"value,omitempty"`
}

var maxAge = utils.MustDuration(utils.GetIntEnv("CLEANUP_CONTROLLER_MAX_AGE", 10)) * time.Minute

func NewController(user, userId, token, task string) *Controller {
	return &Controller{
		User:      user,
		UserID:    userId,
		Token:     token,
		Task:      task,
		Namespace: fmt.Sprintf("%s-%s", task, userId),
		ExpiredAt: fmt.Sprintf("%d", time.Now().Add(maxAge).Unix()),
	}
}
func (c *Controller) CheckIfPodExists(name string) error {
	k8s := client.Init(c.Token)
	const maxRetries = 10                 // Максимальное количество попыток проверки существования Pod
	const retryInterval = 1 * time.Second // Интервал между попытками

	var podFound bool
	for i := 0; i < maxRetries; i++ {
		_, err := k8s.UserClient.CoreV1().Pods(c.Namespace).Get(context.TODO(), name, metav1.GetOptions{})
		if err == nil {
			podFound = true
			break
		}

		// Если Pod не найден, ждем перед следующей попыткой
		time.Sleep(retryInterval)
	}

	if !podFound {
		log.Println("Can't find pod")
		return fmt.Errorf("pod not found")
	}
	return nil
}

func (c *Controller) getIngressInfo() []Ingress { return []Ingress{} }
func (c *Controller) getAuthInfo() []Auth       { return []Auth{} }

func (c *Controller) GetInfo() ([]StatusMessage, error) {
	k8s := client.Init(c.Token)
	pods, err := k8s.UserClient.CoreV1().Pods(c.Namespace).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("can't list pods: ", err)
	}
	info := []StatusMessage{}
	for _, pod := range pods.Items {
		info = append(info, StatusMessage{
			Name:        pod.Name,
			Status:      string(pod.Status.Phase),
			Description: pod.Annotations["learnops/description"],
			Ingress:     c.getIngressInfo(),
			Auth:        c.getAuthInfo(),
		})
	}
	return info, nil
}

func (c *Controller) Watch(name string, wsConn *websocket.Conn) error {
	err := c.CheckIfPodExists(name)
	if err != nil {
		wsConn.WriteJSON(StatusMessage{
			Name:   c.Task,
			Status: "not-found",
		})
		return err
	}
	k8s := client.Init(c.Token)
	uri := fmt.Sprintf("wss://%s/xterm.js", utils.GenHostName(name, c.Task, c.User))
	statusMsg := StatusMessage{
		Name:      c.Task,
		Uri:       uri,
		ExpiredAt: c.ExpiredAt,
	}

	watcher, err := k8s.UserClient.CoreV1().Pods(c.Namespace).Watch(context.TODO(), metav1.ListOptions{
		FieldSelector: fmt.Sprintf("metadata.name=%s", name),
	})
	if err != nil {
		log.Println("Ошибка создания watcher:", err)
		statusMsg.Status = "error"
		wsConn.WriteJSON(statusMsg)
		return err
	}
	defer watcher.Stop()

	for event := range watcher.ResultChan() {
		pod, ok := event.Object.(*v1.Pod)
		if !ok {
			log.Println("Ошибка преобразования объекта в Pod")
			continue
		}

		// Проверяем статус Pod
		switch pod.Status.Phase {
		case v1.PodPending:
			statusMsg.Status = "pending"
			wsConn.WriteJSON(statusMsg)
		case v1.PodRunning:
			statusMsg.Status = "ready"
			wsConn.WriteJSON(statusMsg)
			return nil
		case v1.PodFailed:
			statusMsg.Status = "failed"
			wsConn.WriteJSON(statusMsg)
			return nil
		case v1.PodUnknown:
			statusMsg.Status = "failed"
			wsConn.WriteJSON(statusMsg)
		}
	}
	return nil
}
