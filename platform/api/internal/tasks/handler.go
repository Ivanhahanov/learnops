package tasks

import (
	"net/http"
	"platform/pkg/database"
	"platform/pkg/tasks"
	"platform/pkg/tasks/controller"
	"platform/pkg/tasks/provider"

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

	var task database.Task
	err := database.DbManager().Select("manifest").Where("name = ?", taskName).First(&task).Error
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	err = provider.InitCapsule(
		c.Get("user").(*database.User),
		c.Get("token").(string),
	).Deploy(task.Manifest)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}
	// TODO: normal answer
	return c.JSON(http.StatusOK, "ok")
}

func StopTask(c echo.Context) error {
	user := c.Get("user").(*database.User)
	err := provider.InitCapsule(
		user,
		c.Get("token").(string),
	).Destroy(user.ID.String())

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}
	// TODO: normal answer
	return c.String(http.StatusOK, "ok")
}

func VerifyTask(c echo.Context) error {
	taskName := c.Param("name")
	result := tasks.VerifyTask(
		c.Get("user").(*database.User).ID,
		c.Get("token").(string),
		taskName,
	)
	return c.JSON(http.StatusOK, result)
}

func GetServiceMap(c echo.Context) error {
	serviceMap, err := controller.NewController(
		c.Get("user").(*database.User),
		c.Get("token").(string),
	).GetInfo()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, serviceMap)
}
