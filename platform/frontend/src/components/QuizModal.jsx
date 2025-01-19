import React, { useState } from "react";

const QuizModal = ({ isOpen, onClose, questions, modalId }) => {
  const [answers, setAnswers] = useState({});

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = () => {
    console.log("User answers:", answers);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div id={`modal-${modalId}`} className="modal modal-open">
      <div className="modal-box w-11/12 max-w-3xl">
        <h2 className="font-bold text-lg">Тестирование</h2>

        <div className="py-4 space-y-4">
          {questions.map((question, index) => (
            <div key={question.id || index}>
              <p className="font-medium py-2">
                {index + 1}. {question.text}
              </p>
              {question.type === "choice" && (
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label key={optionIndex} className="flex items-center">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option.option}
                        onChange={(e) =>
                          handleAnswerChange(question.id || index, e.target.value)
                        }
                        className="radio radio-primary mr-2"
                      />
                      {option.option}
                    </label>
                  ))}
                </div>
              )}
              {question.type === "text" && (
                <textarea
                  className="textarea textarea-bordered w-3/4"
                  placeholder="Ваш ответ"
                  onChange={(e) =>
                    handleAnswerChange(question.id || index, e.target.value)
                  }
                />
              )}
              {question.type === "true-false" && (
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value="true"
                      onChange={(e) =>
                        handleAnswerChange(question.id || index, e.target.value)
                      }
                      className="radio radio-primary mr-2"
                    />
                    Да
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value="false"
                      onChange={(e) =>
                        handleAnswerChange(question.id || index, e.target.value)
                      }
                      className="radio radio-primary mr-2"
                    />
                    Нет
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="modal-action">
          <button className="btn btn-primary" onClick={handleSubmit}>
            Отправить
          </button>
          <button className="btn" onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
