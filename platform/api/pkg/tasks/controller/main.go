package controller

import (
	"context"
	"fmt"
	"log"
	"platform/pkg/client"
	"platform/pkg/database"
	"platform/pkg/utils"
	"time"

	"github.com/gorilla/websocket"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type Controller struct {
	User      *database.User
	Token     string
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

func NewController(user *database.User, token string) *Controller {
	return &Controller{
		User:      user,
		Token:     token,
		Namespace: user.ID.String(),
		ExpiredAt: fmt.Sprintf("%d", time.Now().Add(maxAge).Unix()),
	}
}
func (c *Controller) CheckIfDeploymentExists(name string) error {
	k8s := client.Init(c.Token)
	const maxRetries = 10                 // Максимальное количество попыток проверки существования Pod
	const retryInterval = 2 * time.Second // Интервал между попытками

	var deploymentFound bool
	for i := 0; i < maxRetries; i++ {
		deployment, err := k8s.UserClient.AppsV1().Deployments(c.Namespace).Get(context.TODO(), name, metav1.GetOptions{})
		if err == nil {
			if deployment.Status.AvailableReplicas > 0 {
				deploymentFound = true
				break
			}
		}
		time.Sleep(retryInterval)
	}

	if !deploymentFound {
		log.Println("Can't find a ready deployment")
		return fmt.Errorf("deployment not found or not ready")
	}
	return nil
}

func (c *Controller) getIngressInfo(pod v1.Pod) []Ingress {
	url, ok := pod.Annotations["learnops/url"]
	if !ok {
		return []Ingress{}
	}
	return []Ingress{
		{
			Name: "Link",
			Url:  url,
		},
	}
}
func (c *Controller) getAuthInfo() []Auth { return []Auth{} }

func (c *Controller) GetInfo() ([]StatusMessage, error) {
	k8s := client.Init(c.Token)
	pods, err := k8s.UserClient.CoreV1().Pods(c.Namespace).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("can't list pods: ", err)
	}
	info := []StatusMessage{}
	for _, pod := range pods.Items {
		info = append(info, StatusMessage{
			Name:        pod.Annotations["learnops/name"],
			Status:      string(pod.Status.Phase),
			Description: pod.Annotations["learnops/description"],
			Ingress:     c.getIngressInfo(pod),
			Auth:        c.getAuthInfo(),
		})
	}
	return info, nil
}

func (c *Controller) Watch(name string, wsConn *websocket.Conn) error {
	err := c.CheckIfDeploymentExists(name)
	if err != nil {
		wsConn.WriteJSON(StatusMessage{
			Name:   c.User.ID.String(),
			Status: "not-found",
		})
		return err
	}
	k8s := client.Init(c.Token)
	statusMsg := StatusMessage{
		Name:      c.User.ID.String(),
		ExpiredAt: c.ExpiredAt,
	}

	watcher, err := k8s.UserClient.CoreV1().Pods(c.Namespace).Watch(context.TODO(), metav1.ListOptions{
		LabelSelector: fmt.Sprintf("app=%s", name),
	})
	if err != nil {
		log.Println("can't create watcher:", err)
		statusMsg.Status = "error"
		wsConn.WriteJSON(statusMsg)
		return err
	}
	defer watcher.Stop()

	for event := range watcher.ResultChan() {
		pod, ok := event.Object.(*v1.Pod)
		if !ok {
			log.Println("can't convert to Pod")
			continue
		}

		// Проверяем статус Pod
		switch pod.Status.Phase {
		case v1.PodPending:
			statusMsg.Status = "pending"
			wsConn.WriteJSON(statusMsg)
		case v1.PodRunning:
			statusMsg.Status = "ready"
			statusMsg.Uri = pod.Annotations["learnops/ws"]
			wsConn.WriteJSON(statusMsg)
			return nil
		case v1.PodFailed, v1.PodUnknown:
			statusMsg.Status = "failed"
			wsConn.WriteJSON(statusMsg)
			return nil
		}
	}
	return nil
}
