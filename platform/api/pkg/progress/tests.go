package progress

import (
	"fmt"
	"platform/pkg/database"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserAnswer struct {
	QuestionID uuid.UUID `json:"question_id"`
	Answer     string    `json:"answer"`
}

type QuizResponse struct {
	Status  string          `json:"status,omitempty"`
	Message string          `json:"message,omitempty"`
	Report  map[string]bool `json:"report,omitempty"`
}

func allCorrect(answers map[string]bool) bool {
	if len(answers) == 0 {
		return false
	}
	for _, value := range answers {
		if !value {
			return false
		}
	}
	return true
}

func CheckQuizAnswers(db *gorm.DB, quizID uuid.UUID, userAnswers map[string]string) (*QuizResponse, error) {
	// Загрузить все вопросы и опции для данного квиза
	var questions []database.Question
	if err := db.Preload("Options").Where("quiz_id = ?", quizID).Find(&questions).Error; err != nil {
		return nil, fmt.Errorf("не удалось загрузить вопросы для квиза: %w", err)
	}

	// Создаем карту для быстрого доступа к вопросам по ID
	questionMap := make(map[string]database.Question)
	for _, question := range questions {
		questionMap[question.ID.String()] = question
	}

	// Результаты проверки
	resp := QuizResponse{
		Status: "failed",
		Report: make(map[string]bool),
	}

	// Проверяем ответы пользователя
	for questionID, userAnswer := range userAnswers {
		question, exists := questionMap[questionID]
		if !exists {
			resp.Report[questionID] = false // Если вопрос не найден, отмечаем как неверный
			continue
		}

		// Проверяем ответ в зависимости от типа вопроса
		switch question.Type {
		case "choice":
			// Проверка для multiple-choice вопроса
			foundCorrect := false
			for _, option := range question.Options {
				if option.Option == userAnswer && option.IsRight {
					foundCorrect = true
					break
				}
			}
			resp.Report[questionID] = foundCorrect

		case "text":
			// Проверка для текстового вопроса
			resp.Report[questionID] = question.Right == userAnswer

		case "true-false":
			// Проверка для true/false вопроса
			expectedAnswer := "true"
			if question.Right == "false" {
				expectedAnswer = "false"
			}
			resp.Report[questionID] = expectedAnswer == userAnswer

		default:
			resp.Report[questionID] = false // Для неизвестных типов отмечаем как неверный
		}
	}
	if allCorrect(resp.Report) {
		resp.Status = "success"
		resp.Message = "congrats"

	}

	return &resp, nil
}
