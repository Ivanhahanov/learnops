package tasks

import (
	"context"
	"fmt"
	"log"
	"platform/pkg/client"
	"platform/pkg/utils"
	"time"

	"github.com/gorilla/websocket"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func CheckIngressWebSocketReady(wsURL string) bool {
	dialer := websocket.Dialer{}
	conn, _, err := dialer.Dial(wsURL, nil)
	if err == nil {
		conn.Close()
		return true
	}
	log.Println(err.Error())
	return false
}

func GetStatus(ns, user, token string) (*ConnectionInfo, error) {
	c := client.Init(token)
	pod, err := c.UserClient.CoreV1().Pods(ns).Get(context.Background(), "terminal", v1.GetOptions{})
	if err != nil {
		log.Println(err)
	}
	status := string(pod.Status.Phase)

	uri := fmt.Sprintf("wss://%s/xterm.js", utils.GenHostName("terminal", ns, user))
	if status == "Running" {
		if CheckIngressWebSocketReady(uri) {
			status = "Ready"
		}
	}
	return &ConnectionInfo{
		Uri:       uri,
		Status:    status,
		ExpiredAt: fmt.Sprintf("%d", time.Now().Add(time.Minute*10).Unix()), //TODO: fix logic
	}, nil
}
