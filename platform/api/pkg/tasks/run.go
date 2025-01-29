package tasks

import (
	"fmt"
	"platform/pkg/tasks/provider"
	"platform/pkg/utils"
	"time"
)

type ConnectionInfo struct {
	Uri       string `json:"uri,omitempty"`
	Status    string `json:"status,omitempty"`
	ExpiredAt string `json:"expired_at,omitempty"`
}

func RunTask(name, user, userId, token string) (*ConnectionInfo, error) {
	if err := provider.InitCapsule(name, user, userId, token).Deploy(); err != nil {
		return nil, err
	}
	return &ConnectionInfo{
		Uri:       fmt.Sprintf("wss://%s/xterm.js", utils.GenHostName("terminal", name, user)),
		Status:    "Pending",
		ExpiredAt: fmt.Sprintf("%d", time.Now().Add(time.Minute*10).Unix()), //TODO: fix logic
	}, nil
}
