package tasks

import (
	"net/http"
	"platform/pkg/tasks"
	"platform/pkg/tasks/controller"
	"platform/pkg/tasks/provider"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func Readme(c echo.Context) error {
	taskId := c.Param("name")
	return c.String(
		http.StatusOK,
		tasks.GetReadme(taskId),
	)
}

func RunTask(c echo.Context) error {
	taskName := c.Param("name")

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
	taskName := c.Param("name")
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
	result := tasks.VerifyTask(
		c.Get("user_id").(uuid.UUID),
		taskName,
		c.Get("token").(string),
	)
	return c.JSON(http.StatusOK, result)
}

func GetServiceMap(c echo.Context) error {
	serviceMap, err := controller.NewController(
		c.Get("name").(string),
		c.Get("token").(string),
		c.Param("name"),
		"",
		nil,
	).GetInfo()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, serviceMap)
}
