import React, { useState, useEffect } from "react";
import { useAuth } from "../context/OAuthContext";
import confetti from "canvas-confetti";


const QuizModal = ({ isOpen, onClose, quizId, setModules }) => {
  const { user } = useAuth();
  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false); // Состояние для загрузки
  const [error, setError] = useState(null); // Состояние для обработки ошибок
  const [feedback, setFeedback] = useState(null); // Сообщение об ошибке прохождения теста

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch(`/api/quiz/${quizId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id_token}`,
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка отправки данных");
      }

      const result = await response.json();
      console.log("Ответ от API:", result);

      if (result.status === "failed") {
        setFeedback(result.message || "Тест пройден неправильно. Попробуйте ещё раз.");
      }
      else if (result.status === "success") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setModules((prevModules) =>
          prevModules.map((module) => ({
            ...module,
            quizzes: module.quizzes.map((quiz) =>
              quiz.id === quizId ? { ...quiz, completed: true } : quiz
            ),
          }))
        );
        onClose();
      }
    } catch (error) {
      console.error("Ошибка при отправке теста:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quiz/${quizId}`, {
        headers: {
          Authorization: `Bearer ${user.id_token}`,
        },
      });
      const data = await response.json();
      setQuestions(data.questions);
      console.log(data);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchQuiz();
    }
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div id={quizId} className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl flex flex-col gap-1">
            <h2 className="font-bold text-2xl text-center">Тестирование</h2>

            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            {feedback && (
              <div className="alert alert-warning mb-4">
                <span>{feedback}</span>
              </div>
            )}

            <div className="space-y-6 overflow-y-auto max-h-[70vh]">
              {questions.map((question, index) => (
                <div key={question.id || index} className="p-4 bg-base-100 rounded-lg shadow">
                  <p className="font-medium mb-3 text-lg">
                    {index + 1}. {question.text}
                  </p>

                  {question.type === "choice" && (
                    <div className="space-y-3">
                      {question.options.map((option, optionIndex) => (
                        <label
                          key={optionIndex}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={option.option}
                            onChange={(e) =>
                              handleAnswerChange(question.id || index, e.target.value)
                            }
                            className="radio radio-primary transition-transform transform hover:scale-110 focus:scale-110"
                          />
                          <span className="text-base">{option.option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {question.type === "text" && (
                    <textarea
                      className="textarea textarea-bordered w-full"
                      placeholder="Ваш ответ"
                      onChange={(e) =>
                        handleAnswerChange(question.id || index, e.target.value)
                      }
                    />
                  )}

                  {question.type === "true-false" && (
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value="true"
                          onChange={(e) =>
                            handleAnswerChange(question.id || index, e.target.value)
                          }
                          className="radio radio-primary transition-transform transform hover:scale-110 focus:scale-110"
                        />
                        <span className="text-base">Да</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value="false"
                          onChange={(e) =>
                            handleAnswerChange(question.id || index, e.target.value)
                          }
                          className="radio radio-primary transition-transform transform hover:scale-110 focus:scale-110"
                        />
                        <span className="text-base">Нет</span>
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="modal-action justify-end gap-3 m-1">
              <button
                className={`btn btn-primary ${loading ? "loading" : ""}`}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Отправка..." : "Отправить"}
              </button>
              <button
                className="btn btn-outline"
                onClick={onClose}
                disabled={loading}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuizModal;
