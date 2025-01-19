package utils

import (
	"fmt"
	"os"
	"platform/pkg/config"
)

func IsRunningInCluster() bool {
	// Обычно, в Kubernetes присутствуют файлы service account и переменные среды.
	if _, err := os.Stat("/var/run/secrets/kubernetes.io/serviceaccount/token"); err == nil {
		return true
	}

	// Также можно проверить переменную среды, характерную для Kubernetes.
	if os.Getenv("KUBERNETES_SERVICE_HOST") != "" {
		return true
	}

	return false
}

func GenHostName(app, tenant, user string) string {
	return fmt.Sprintf("%s.%s-%s.%s", app, tenant, user, config.GetConfig().Domain)
}
