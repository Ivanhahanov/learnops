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
	"k8s.io/client-go/tools/remotecommand"
	"k8s.io/kubectl/pkg/scheme"
)

const (
	CompletedStatus = "Completed"
)

func VerifyTask(userID uuid.UUID, taskName, token string) (string, error) {
	var task database.Task
	db := database.DbManager()
	if err := db.Where(&database.Task{Name: taskName}).First(&task).Error; err != nil {
		log.Println(err)
	}
	if task.Validate == "" {
		return "", fmt.Errorf("no verify script")
	}

	// output, stderr, err := execPod(task.Name, "terminal", token, task.Validate)
	// if err != nil {
	// 	log.Println("err", err)
	// 	return "", fmt.Errorf(err.Error())
	// }
	// if stderr != "" {
	// 	log.Println("stderr:", stderr)
	// 	return "", fmt.Errorf(stderr)
	// }
	output := "ok"
	fmt.Printf("%q\n", output)
	if output == "ok" {
		if err := progress.MarkProgress(userID, task.ID, "task"); err != nil {
			return "", err
		}
	}
	return output, nil
}

// func submitTask(taskName string, username string) error {

// 	db := database.DbManager()

// 	// Find user id
// 	var user models.User
// 	db.Where("name = ?", username).First(&user)

// 	var taskStatus models.TaskStatus
// 	err := db.Where("user_id = ? AND task_id = ?", user.ID, taskName).First(&taskStatus).Error
// 	if err != nil {
// 		if err == gorm.ErrRecordNotFound {
// 			// Если записи нет, создаем новую
// 			taskStatus = models.TaskStatus{
// 				UserID: user.ID,
// 				TaskID: taskName,
// 				Status: CompletedStatus,
// 			}
// 			if err := db.Create(&taskStatus).Error; err != nil {
// 				return fmt.Errorf("Failed to save task status")
// 			}
// 		} else {
// 			return fmt.Errorf("Database error")
// 		}
// 	} else {
// 		// Если запись уже существует, обновляем статус
// 		taskStatus.Status = CompletedStatus
// 		taskStatus.UpdatedAt = time.Now()
// 		if err := db.Save(&taskStatus).Error; err != nil {
// 			return fmt.Errorf("Failed to update task status")
// 		}
// 	}
// 	return nil
// }

func execPod(ns, name, token, command string) (string, string, error) {
	c := client.Init(token)
	buf := &bytes.Buffer{}
	errBuf := &bytes.Buffer{}
	request := c.UserClient.CoreV1().RESTClient().
		Post().
		Namespace(ns).
		Resource("pods").
		Name(name).
		SubResource("exec").
		VersionedParams(&v1.PodExecOptions{
			Command: []string{"/bin/sh", "-c", command},
			Stdin:   false,
			Stdout:  true,
			Stderr:  true,
			TTY:     true,
		}, scheme.ParameterCodec)
	exec, err := remotecommand.NewSPDYExecutor(c.UserConfig, "POST", request.URL())
	err = exec.StreamWithContext(context.Background(), remotecommand.StreamOptions{
		Stdout: buf,
		Stderr: errBuf,
	})
	if err != nil {
		return "", "", fmt.Errorf("%w Failed executing command %s on %v/%v", err, command, ns, name)
	}

	return strings.TrimRight(buf.String(), "\r\n"), errBuf.String(), nil
}
