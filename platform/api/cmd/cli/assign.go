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
	User    string   `json:"username"`
	Courses []string `json:"courses"`
}

func AssignCoursesToUser(cmd *cli.Command) {
	req := AssignCourseRequest{
		User:    cmd.String("user"),
		Courses: cmd.StringSlice("course"),
	}
	data, err := json.Marshal(req)
	if err != nil {
		panic(err)
	}
	token, err := readTokenFromFile(cmd.String("token-path"))
	if err != nil {
		panic(err)
	}
	url, _ := url.JoinPath(cmd.String("host"), "/api/admin/courses/assign")
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
	body, _ := io.ReadAll(response.Body)
	fmt.Println("response:", string(body))
}
