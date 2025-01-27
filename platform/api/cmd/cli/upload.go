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

	"github.com/urfave/cli/v3"
	"sigs.k8s.io/yaml"
)

func (c *Course) Upload(cmd *cli.Command) {
	data, err := json.Marshal(c.Course)
	if err != nil {
		panic(err)
	}
	token, err := readTokenFromFile(cmd.String("token-path"))
	if err != nil {
		panic(err)
	}
	url, _ := url.JoinPath(cmd.String("host"), "/api/admin/course/upload")
	request, error := http.NewRequest("POST", url, bytes.NewBuffer(data))
	request.Header.Set("Content-Type", "application/json; charset=UTF-8")
	request.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token.IDToken))

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
	for i, module := range c.Course.Modules {
		if module.Order == 0 {
			module.Order = i
		}
		for _, task := range module.Tasks {
			task.Readme = c.getTaskText(module.Name, task.Name)
			task.Validate = c.getTaskValidationScript(module.Name, task.Name)
		}
		for _, lecture := range module.Lectures {
			lecture.Content = c.getLectureText(module.Name, lecture.Name)
		}
		for _, quiz := range module.Quizzes {
			quiz.Questions = c.readQuiz(module.Name, quiz.Name)
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
