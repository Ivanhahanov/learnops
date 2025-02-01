package tasks

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"platform/pkg/client"
	"platform/pkg/database"
	"platform/pkg/progress"
	"strings"

	"github.com/google/uuid"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/tools/remotecommand"
	"k8s.io/kubectl/pkg/scheme"
)

const (
	CompletedStatus = "Completed"
)

type VerifyTaskResponse struct {
	Status string `json:"status,omitempty"`
	Answer string `json:"answer,omitempty"`
	Error  string `json:"error,omitempty"`
}

func VerifyTask(userID uuid.UUID, token, taskName string) *VerifyTaskResponse {
	var task database.Task
	var result = &VerifyTaskResponse{
		Status: "failed",
	}
	var err error
	db := database.DbManager()
	if err := db.Where("name = ?", taskName).First(&task).Error; err != nil {
		log.Println(err)
	}
	if task.Validate == "" {
		result.Error = "no verify script"
		return result
	}
	result.Answer, result.Error, err = execDeploymentPod(userID.String(), "terminal", token, task.Validate)
	if err != nil {
		result.Error = err.Error()
		return result
	}
	if result.Error != "" {
		return result
	}
	if result.Answer == "ok" {
		if err := progress.MarkProgress(userID, task.ID, "task"); err != nil {
			result.Error = err.Error()
			return result
		}
		result.Status = "success"
	}
	return result
}
func execDeploymentPod(ns, deploymentName, token, command string) (string, string, error) {
	c := client.Init(token)
	pods, err := c.UserClient.CoreV1().Pods(ns).List(context.TODO(), metav1.ListOptions{
		LabelSelector: fmt.Sprintf("app=%s", deploymentName),
	})
	if err != nil {
		return "", "", fmt.Errorf("failed to list pods for deployment %s: %w", deploymentName, err)
	}

	if len(pods.Items) == 0 {
		return "", "", fmt.Errorf("no pods found for deployment %s in namespace %s", deploymentName, ns)
	}

	pod := pods.Items[0]
	buf := &bytes.Buffer{}
	errBuf := &bytes.Buffer{}

	request := c.UserClient.CoreV1().RESTClient().
		Post().
		Namespace(ns).
		Resource("pods").
		Name(pod.Name).
		SubResource("exec").
		VersionedParams(&v1.PodExecOptions{
			Command: []string{"/bin/sh", "-c", command},
			Stdin:   false,
			Stdout:  true,
			Stderr:  true,
			TTY:     true,
		}, scheme.ParameterCodec)

	exec, err := remotecommand.NewSPDYExecutor(c.UserConfig, "POST", request.URL())
	if err != nil {
		return "", "", fmt.Errorf("failed to create executor: %w", err)
	}

	err = exec.StreamWithContext(context.Background(), remotecommand.StreamOptions{
		Stdout: buf,
		Stderr: errBuf,
	})
	if err != nil {
		return "", "", fmt.Errorf("failed to execute command in pod %s/%s: %w", ns, pod.Name, err)
	}

	// Возвращаем вывод и ошибки
	return strings.TrimRight(buf.String(), "\r\n"), errBuf.String(), nil
}
