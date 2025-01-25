package tasks

import (
	"fmt"
	"net/http"
	"platform/pkg/tasks/controller"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Добавьте проверку источника в продакшене
	},
}

func handleWebSocket(c echo.Context) error {
	conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		fmt.Println("Ошибка обновления до WebSocket:", err)
		return err
	}
	defer conn.Close()

	// Запускаем наблюдение за статусом Pod
	controller.NewController(
		c.QueryParam("name"),
		c.QueryParam("token"),
		c.Param("name"),
		"terminal",
		conn,
	).Watch()
	return nil
}
