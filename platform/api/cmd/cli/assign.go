package main

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"github.com/urfave/cli/v3"
)

type AssignCourseRequest struct {
	User   string `json:"user,omitempty"`
	Course string `json:"course,omitempty"`
}

func AssignCourseToUser(cmd *cli.Command) {
	req := AssignCourseRequest{
		User:   cmd.String("user"),
		Course: cmd.String("course"),
	}
	data, err := json.Marshal(req)
	if err != nil {
		panic(err)
	}
	url, _ := url.JoinPath(cmd.String("host"), "/api/courses/assign")
	request, error := http.NewRequest("POST", url, bytes.NewBuffer(data))
	request.Header.Set("Content-Type", "application/json; charset=UTF-8")

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
