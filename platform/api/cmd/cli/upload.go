package main

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path"
	"platform/pkg/database"
	"strings"

	"github.com/urfave/cli/v3"
	"sigs.k8s.io/yaml"
)

func (c *Course) Upload(cmd *cli.Command) {
	data, err := json.Marshal(c.Course)
	if err != nil {
		panic(err)
	}
	url, _ := url.JoinPath(cmd.String("host"), "/api/course/upload")
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

func (c *Course) EnrichFiles() {
	for _, module := range c.Course.Modules {
		for _, task := range module.Tasks {
			task.Readme = c.getTaskText(module.Name, task.Name)
			task.Validate = c.getTaskValidationScript(module.Name, task.Name)
			task.UniqueIndex = strings.Join(
				[]string{
					c.Course.Name,
					module.Name,
					task.Name,
				},
				"-",
			)
			//fmt.Println(task.Name, task.Readme, task.Validate)
		}
		for _, lecture := range module.Lectures {
			lecture.Content = c.getLectureText(module.Name, lecture.Name)
			lecture.UniqueIndex = strings.Join(
				[]string{
					c.Course.Name,
					module.Name,
					lecture.Name,
				},
				"-",
			)
			//fmt.Println(lecture.Name, lecture.Content)
		}
		for _, quiz := range module.Quizzes {
			quiz.Questions = c.readQuiz(module.Name, quiz.Name)
			quiz.UniqueIndex = strings.Join(
				[]string{
					c.Course.Name,
					module.Name,
					quiz.Name,
				},
				"-",
			)
			//fmt.Println(quiz.Name, quiz.Questions)
		}
	}
	fmt.Println(c.Course)
}

func (c *Course) getTaskText(module, name string) string {
	return readFile(path.Join(c.BaseDir, module, name, "README.md"))
}
func (c *Course) getLectureText(module, name string) string {
	return readFile(path.Join(c.BaseDir, module, fmt.Sprintf("%s.md", name)))
}
func (c *Course) getTaskValidationScript(module, name string) string {
	return readFile(path.Join(c.BaseDir, module, name, "validate.sh"))
}
func getTaskHints() string { return "" }

func readFile(path string) string {
	data, err := os.ReadFile(path)
	if err != nil {
		panic(err)
	}
	return string(data)
}

func (c *Course) readQuiz(module, name string) []*database.Question {
	var questions []*database.Question
	filePath := path.Join(c.BaseDir, module, fmt.Sprintf("%s.yml", name))
	yamlFile, err := os.ReadFile(filePath)
	if err != nil {
		panic(err)
	}
	err = yaml.Unmarshal(yamlFile, &questions)
	if err != nil {
		panic(err)
	}
	return questions
}

// func (c *Config) Upload(cmd *cli.Command, base string) {
// 	for _, course := range c.Courses {
// 		for _, task := range course.Tasks {
// 			Enrich(task, base, course.ID)
// 		}
// 		for _, lecture := range course.Lectures {
// 			EnrichLecture(lecture, base, course.ID)
// 		}
// 	}
// 	for _, course := range c.Courses {
// 		fmt.Println(course)
// 		for _, task := range course.Tasks {
// 			fmt.Println(task)
// 		}
// 	}
// 	data, err := json.Marshal(c.Courses)
// 	if err != nil {
// 		panic(err)
// 	}
// 	url, _ := url.JoinPath(cmd.String("host"), "/api/courses/upload")
// 	request, error := http.NewRequest("POST", url, bytes.NewBuffer(data))
// 	request.Header.Set("Content-Type", "application/json; charset=UTF-8")
// 	request.Header.Set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiIiwidXNlcl9pZCI6MTAzNzU2NDEzNjY3NTQ3NTQ1NywiQ2xhaW1zIjp7ImV4cCI6MTczNjcxMzQ4MH19._pjAPR1jsgrLupnljnONNXdtex6bV9aQm0-aHCzXjEI")

// 	client := &http.Client{
// 		Transport: &http.Transport{
// 			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
// 		},
// 	}
// 	response, error := client.Do(request)
// 	if error != nil {
// 		panic(error)
// 	}
// 	defer response.Body.Close()
// 	fmt.Println(response.StatusCode)
// 	body, _ := io.ReadAll(response.Body)
// 	fmt.Println("response Body:", string(body))
// }

// func Enrich(task *models.Task, base, courseId string) error {
// 	basePath := path.Join(base, courseId, task.ID)
// 	task.Readme = getTaskText(basePath)
// 	task.Validator = getTaskValidationScript(basePath)
// 	return nil
// }

// func EnrichLecture(lecture *models.Lecture, base, courseId string) error {
// 	basePath := path.Join(base, courseId, lecture.ID)
// 	lecture.Text = getLectureText(basePath)
// 	return nil
// }
