package main

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"path"
	"platform/pkg/models"

	"github.com/urfave/cli/v3"
)

func (c *Config) Upload(cmd *cli.Command, base string) {
	for _, course := range c.Courses {
		for _, task := range course.Tasks {
			Enrich(task, base, course.ID)
		}
		for _, lecture := range course.Lectures {
			EnrichLecture(lecture, base, course.ID)
		}
	}
	for _, course := range c.Courses {
		fmt.Println(course)
		for _, task := range course.Tasks {
			fmt.Println(task)
		}
	}
	data, err := json.Marshal(c.Courses)
	if err != nil {
		panic(err)
	}
	url, _ := url.JoinPath(cmd.String("host"), "/api/courses/upload")
	request, error := http.NewRequest("POST", url, bytes.NewBuffer(data))
	request.Header.Set("Content-Type", "application/json; charset=UTF-8")
	request.Header.Set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiIiwidXNlcl9pZCI6MTAzNzU2NDEzNjY3NTQ3NTQ1NywiQ2xhaW1zIjp7ImV4cCI6MTczNjcxMzQ4MH19._pjAPR1jsgrLupnljnONNXdtex6bV9aQm0-aHCzXjEI")

	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}
	response, error := client.Do(request)
	if error != nil {
		panic(error)
	}
	defer response.Body.Close()
	fmt.Println(response.StatusCode)
	body, _ := io.ReadAll(response.Body)
	fmt.Println("response Body:", string(body))
}

func Enrich(task *models.Task, base, courseId string) error {
	basePath := path.Join(base, courseId, task.ID)
	task.Readme = getTaskText(basePath)
	task.Validator = getTaskValidationScript(basePath)
	return nil
}

func EnrichLecture(lecture *models.Lecture, base, courseId string) error {
	basePath := path.Join(base, courseId, lecture.ID)
	lecture.Text = getLectureText(basePath)
	return nil
}
