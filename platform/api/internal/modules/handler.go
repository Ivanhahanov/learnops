package modules

import (
	"fmt"
	"net/http"
	"platform/pkg/database"
	"platform/pkg/progress"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type QuizAnswers struct {
	Answers map[string]string `json:"answers,omitempty"`
}

func CheckQuiz(c echo.Context) error {
	var req QuizAnswers
	quizID := uuid.MustParse(c.Param("id"))
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid request format"})
	}
	db := database.DbManager()
	results, err := progress.CheckQuizAnswers(db, quizID, req.Answers)
	if err != nil {
		return fmt.Errorf("Ошибка проверки ответов:", err)
	}
	if results.Status == "success" {
		if err := progress.MarkProgress(c.Get("user").(*database.User).ID, quizID, "quiz"); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{
				"error": err.Error(),
			})
		}
	}
	return c.JSON(200, results)
}
