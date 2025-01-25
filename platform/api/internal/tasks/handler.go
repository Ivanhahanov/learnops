package tasks

import (
	"net/http"
	"platform/pkg/tasks"
	"platform/pkg/tasks/provider"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func Readme(c echo.Context) error {
	taskId := c.Param("id")
	return c.String(
		http.StatusOK,
		tasks.GetReadme(taskId),
	)
}

func RunTask(c echo.Context) error {
	taskName := c.Param("id")

	err := provider.InitCapsule(taskName, c.Get("name").(string), c.Get("token").(string)).Deploy()
	if err != nil {
		return err
	}
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}
	// TODO: normal answer
	return c.JSON(http.StatusOK, "ok")
}

func StopTask(c echo.Context) error {
	taskName := c.Param("id")
	err := provider.InitCapsule(taskName,
		c.Get("name").(string),
		c.Get("token").(string)).Destroy()

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}
	// TODO: normal answer
	return c.String(http.StatusOK, "ok")
}

func VerifyTask(c echo.Context) error {
	taskName := c.Param("name")
	verdict, err := tasks.VerifyTask(
		c.Get("user_id").(uuid.UUID),
		taskName,
		c.Get("token").(string),
	)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}
	return c.String(http.StatusOK, verdict)
}
