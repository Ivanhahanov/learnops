package tasks

import (
	"fmt"
	"platform/pkg/tasks/provider"
)

type ConnectionInfo struct {
	Uri    string `json:"uri,omitempty"`
	Status string `json:"status"`
}

func RunTask(name, user, token string) (*ConnectionInfo, error) {
	if err := provider.InitCapsule(name, user, token).Deploy(); err != nil {
		return nil, err
	}
	return &ConnectionInfo{
		Uri:    fmt.Sprintf("ws://localhost/%s/xterm.js", user),
		Status: "Pending",
	}, nil
}
