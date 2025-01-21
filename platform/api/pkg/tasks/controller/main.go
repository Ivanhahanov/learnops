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
	Token     string
	Task      string
	Pod       string
	wsConn    *websocket.Conn
	ExpiredAt string
}

type StatusMessage struct {
	Name      string `json:"name,omitempty"`
	Uri       string `json:"uri,omitempty"`
	Status    string `json:"status,omitempty"`
	ExpiredAt string `json:"expired_at,omitempty"`
}

func NewController(user, token, task, pod string, wsConn *websocket.Conn) *Controller {
	return &Controller{
		User:      user,
		Token:     token,
		Task:      task,
		Pod:       pod,
		ExpiredAt: fmt.Sprintf("%d", time.Now().Add(time.Minute*10).Unix()),
		wsConn:    wsConn,
	}
}
func (c *Controller) CheckIfPodExists() error {
	k8s := client.Init(c.Token)
	const maxRetries = 10                 // Максимальное количество попыток проверки существования Pod
	const retryInterval = 1 * time.Second // Интервал между попытками

	var podFound bool
	for i := 0; i < maxRetries; i++ {
		_, err := k8s.UserClient.CoreV1().Pods(c.Task).Get(context.TODO(), c.Pod, metav1.GetOptions{})
		if err == nil {
			podFound = true
			break
		}

		// Если Pod не найден, ждем перед следующей попыткой
		time.Sleep(retryInterval)
	}

	if !podFound {
		log.Println("Pod не найден после нескольких попыток")
		c.wsConn.WriteJSON(StatusMessage{
			Name:   c.Task,
			Status: "not-found",
		})
		return fmt.Errorf("pod not found")
	}
	return nil
}

func (c *Controller) Watch() error {
	err := c.CheckIfPodExists()
	if err != nil {
		return err
	}
	k8s := client.Init(c.Token)
	uri := fmt.Sprintf("wss://%s/xterm.js", utils.GenHostName(c.Pod, c.Task, c.User))
	statusMsg := StatusMessage{
		Name:      c.Task,
		Uri:       uri,
		ExpiredAt: c.ExpiredAt,
	}

	watcher, err := k8s.UserClient.CoreV1().Pods(c.Task).Watch(context.TODO(), metav1.ListOptions{
		FieldSelector: fmt.Sprintf("metadata.name=%s", c.Pod),
	})
	if err != nil {
		log.Println("Ошибка создания watcher:", err)
		statusMsg.Status = "error"
		c.wsConn.WriteJSON(statusMsg)
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
			c.wsConn.WriteJSON(statusMsg)
		case v1.PodRunning:
			statusMsg.Status = "ready"
			c.wsConn.WriteJSON(statusMsg)
			return nil
		// case v1.PodSucceeded:
		// 	statusMsg.Status = "ready"
		// 	c.wsConn.WriteJSON(statusMsg)
		// 	return // Завершаем наблюдение
		case v1.PodFailed:
			statusMsg.Status = "failed"
			c.wsConn.WriteJSON(statusMsg)
			return nil
		case v1.PodUnknown:
			statusMsg.Status = "failed"
			c.wsConn.WriteJSON(statusMsg)
		}
	}
	return nil
}
