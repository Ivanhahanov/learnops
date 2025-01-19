package tasks

import (
	"platform/pkg/tasks/provider"
)

func StopTask(name, user, token string) error {
	return provider.InitCapsule(name, user, token).Destroy()
}
