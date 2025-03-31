import React, { useState, useEffect } from "react";
import LectureModal from "../components/LectureModal";
import QuizModal from "../components/QuizModal";
import { useAuth } from "../context/OAuthContext";
import { useParams, useLocation } from "react-router-dom";
import TaskLink from "../components/TaskLink";
import {
  FiChevronDown,
  FiChevronUp,
  FiBook,
  FiCheckSquare,
  FiTerminal,
  FiPieChart,
  FiFilter,
  FiLayout,
  FiMenu,
  FiX
} from "react-icons/fi";

const ModulesPage = () => {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});
  const [allExpanded, setAllExpanded] = useState(false);
  const { name } = useParams();
  const [filter, setFilter] = useState("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Загрузка модулей
  const fetchModules = async () => {
    try {
      const response = await fetch(`/api/course/${name}`, {
        headers: {
          Authorization: "Bearer " + user.id_token
        }
      });
      const data = await response.json();
      setModules(data);
      const initialExpandedState = data.reduce((acc, module) => {
        acc[module.id] = false;
        return acc;
      }, {});
      setExpandedModules(initialExpandedState);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [location.state]);

  // Фильтрация модулей
  const filteredModules =
    filter === "all"
      ? modules
      : modules.filter(module =>
        filter === "completed" ? module.completed : !module.completed
      );

  // Управление раскрытием модулей
  const toggleModule = id => {
    setExpandedModules(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleAllModules = () => {
    const newExpandedState = !allExpanded;
    const updatedState = modules.reduce((acc, module) => {
      acc[module.id] = newExpandedState;
      return acc;
    }, {});
    setExpandedModules(updatedState);
    setAllExpanded(newExpandedState);
  };

  // Прогресс модуля
  const calculateProgress = module => {
    const total = module.data.length;
    const completed = module.data.filter(row => row.completed).length;
    return Math.round((completed / total) * 100);
  };

  // Управление модальными окнами
  const [testModalStates, setTestModalStates] = useState({});
  const [lectureModalStates, setLectureModalStates] = useState({});

  const openTestModal = modalId => {
    setTestModalStates(prev => ({ ...prev, [modalId]: true }));
  };

  const closeTestModal = modalId => {
    setTestModalStates(prev => ({ ...prev, [modalId]: false }));
  };

  const openLectureModal = modalId => {
    setLectureModalStates(prev => ({ ...prev, [modalId]: true }));
  };

  const closeLectureModal = modalId => {
    setLectureModalStates(prev => ({ ...prev, [modalId]: false }));
  };

  return (
    <div className="container mx-auto py-6 px-4 lg:px-6 max-w-7xl">
      {/* Мобильное меню */}
      <div className="lg:hidden mb-4 flex justify-between items-center">
        <button
          className="btn btn-square btn-ghost"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Открыть меню"
        >
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <div className="text-xl font-bold truncate">Прогресс курса</div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Блок аналитики для мобильных */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="card bg-base-100 shadow-lg mb-4">
              <div className="card-body p-4">
                <CourseProgressStat modules={modules} isMobile />
              </div>
            </div>
          </div>
        )}

        {/* Основной контент */}
        <div className="flex-1 lg:w-8/12 xl:w-9/12">
          {/* Заголовок */}
          <div className="mb-6 p-4 md:p-6 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl shadow-lg">
            <h1 className="text-xl md:text-2xl font-bold mb-2">Добро пожаловать на курс!</h1>
            <p className="text-sm md:text-base opacity-90">Начните изучение материалов прямо сейчас</p>
          </div>

          {/* Панель фильтров */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-ghost"} gap-2`}
                onClick={() => setFilter("all")}
              >
                <FiLayout />
                <span>Все</span>
              </button>
              <button
                className={`btn btn-sm ${filter === "completed" ? "btn-primary" : "btn-ghost"} gap-2`}
                onClick={() => setFilter("completed")}
              >
                <FiCheckSquare />
                <span>Выполненные</span>
              </button>
              <button
                className={`btn btn-sm ${filter === "incomplete" ? "btn-primary" : "btn-ghost"} gap-2`}
                onClick={() => setFilter("incomplete")}
              >
                <FiFilter />
                <span>Невыполненные</span>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                className="btn btn-sm btn-outline gap-2"
                onClick={toggleAllModules}
              >
                {allExpanded ? "Свернуть всё" : "Развернуть всё"}
                {allExpanded ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </div>
          </div>


          {/* Список модулей */}
          <div className="space-y-4">
            {filteredModules.length > 0 ? (
              filteredModules.map((module) => {
                const progress = calculateProgress(module);
                const completedTasks = module.data.filter((row) => row.type === "task" && row.completed).length;
                const completedLectures = module.data.filter((row) => row.type === "lecture" && row.completed).length;
                const completedQuizzes = module.data.filter((row) => row.type === "quiz" && row.completed).length;
                const totalTasks = module.data.filter((row) => row.type === "task").length;
                const totalLectures = module.data.filter((row) => row.type === "lecture").length;
                const totalQuizzes = module.data.filter((row) => row.type === "quiz").length;

                return (
                  <div
                    key={module.id}
                    className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
                    onClick={(e) => {
                        toggleModule(module.id);
                      
                    }}
                  >
                    <div className="card-body p-4 md:p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="p-3 bg-primary/10 rounded-lg text-primary">
                            <FiBook className="text-2xl" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold truncate">{module.title}</h2>
                            <div className="badge badge-primary badge-outline">
                              {progress}%
                            </div>
                          </div>

                          <div className="w-full bg-base-300 rounded-full h-2 mt-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>

                          <div className="flex flex-wrap gap-4 mt-3 text-sm">
                            <div className="flex items-center gap-1">
                              <FiBook className="flex-shrink-0" />
                              <span>{completedLectures}/{totalLectures}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FiTerminal className="flex-shrink-0" />
                              <span>{completedTasks}/{totalTasks}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FiCheckSquare className="flex-shrink-0" />
                              <span>{completedQuizzes}/{totalQuizzes}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex-shrink-0 text-gray-400 transition-transform duration-300 group-hover:text-gray-600">
                          {expandedModules[module.id] ? (
                            <FiChevronUp className="text-2xl" />
                          ) : (
                            <FiChevronDown className="text-2xl" />
                          )}
                        </div>
                      </div>

                      {expandedModules[module.id] && (
                        <div
                          className="mt-4 space-y-3 border-t pt-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {module.data.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center p-3 rounded-lg border border-base-300 bg-base-200 gap-3 hover:bg-base-300 transition-colors"
                            >
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 
              ${item.completed ? "bg-primary" : "bg-gray-300"}`} />

                              <div className="flex-1 min-w-0 flex items-center gap-2">
                                {item.type === "lecture" && (
                                  <FiBook className="text-lg text-primary flex-shrink-0" />
                                )}
                                {item.type === "task" && (
                                  <FiTerminal className="text-lg text-accent flex-shrink-0" />
                                )}
                                {item.type === "quiz" && (
                                  <FiCheckSquare className="text-lg text-info flex-shrink-0" />
                                )}
                                <span className="truncate">{item.title}</span>
                              </div>

                              <div className="ml-auto flex gap-2 flex-shrink-0">
                                {item.type === "lecture" && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openLectureModal(item.id);
                                      }}
                                      className="btn btn-sm btn-primary gap-2 min-w-[120px]"
                                    >
                                      <FiBook /> Читать
                                    </button>
                                    <LectureModal
                                      lectureId={item.id}
                                      isOpen={lectureModalStates[item.id] || false}
                                      onClose={() => closeLectureModal(item.id)}
                                      setModules={setModules}
                                    />
                                  </>
                                )}
                                {item.type === "task" && (
                                  <TaskLink name={item.name} id={item.id}>
                                    <button
                                      className="btn btn-sm btn-accent gap-2 min-w-[120px]"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <FiTerminal /> Перейти
                                    </button>
                                  </TaskLink>
                                )}
                                {item.type === "quiz" && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openTestModal(item.id);
                                      }}
                                      className="btn btn-sm btn-info gap-2 min-w-[120px]"
                                    >
                                      <FiCheckSquare /> Тест
                                    </button>
                                    <QuizModal
                                      quizId={item.id}
                                      isOpen={testModalStates[item.id] || false}
                                      onClose={() => closeTestModal(item.id)}
                                      setModules={setModules}
                                    />
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-6 bg-base-100 rounded-xl">
                <p className="text-gray-500">Нет модулей по выбранным фильтрам</p>
              </div>
            )}
          </div>
        </div>

        {/* Блок аналитики для десктопа */}
        <div className="hidden lg:block lg:w-4/12 xl:w-3/12">
          <div className="sticky top-4 space-y-4">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FiPieChart className="text-primary" />
                  Прогресс курса
                </h3>
                <CourseProgressStat modules={modules} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент статистики курса
const CourseProgressStat = ({ modules, isMobile }) => {
  const data = modules.reduce(
    (acc, module) => {
      acc.totalLectures += module.data.filter(row => row.type === "lecture").length;
      acc.completedLectures += module.data.filter(row => row.type === "lecture" && row.completed).length;
      acc.totalTasks += module.data.filter(row => row.type === "task").length;
      acc.completedTasks += module.data.filter(row => row.type === "task" && row.completed).length;
      acc.totalQuizzes += module.data.filter(row => row.type === "quiz").length;
      acc.completedQuizzes += module.data.filter(row => row.type === "quiz" && row.completed).length;
      return acc;
    },
    {
      completedLectures: 0,
      totalLectures: 0,
      completedTasks: 0,
      totalTasks: 0,
      completedQuizzes: 0,
      totalQuizzes: 0
    }
  );

  const calculatePercentage = (completed, total) =>
    total === 0 ? 0 : Math.round((completed / total) * 100);

  const lectureProgress = calculatePercentage(data.completedLectures, data.totalLectures);
  const taskProgress = calculatePercentage(data.completedTasks, data.totalTasks);
  const quizProgress = calculatePercentage(data.completedQuizzes, data.totalQuizzes);

  return (
    <div className={`space-y-4 ${isMobile ? 'px-2' : ''}`}>
      <div className="flex items-center gap-4">
        <div className="radial-progress text-primary"
          style={{ "--value": calculatePercentage(data.completedLectures, data.totalLectures) }}>
          {calculatePercentage(data.completedLectures, data.totalLectures)}%
        </div>
        <div>
          <div className="font-medium">Лекции</div>
          <div className="text-sm text-gray-500">
            {data.completedLectures}/{data.totalLectures}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="radial-progress text-accent"
          style={{ "--value": calculatePercentage(data.completedTasks, data.totalTasks) }}>
          {calculatePercentage(data.completedTasks, data.totalTasks)}%
        </div>
        <div>
          <div className="font-medium">Задания</div>
          <div className="text-sm text-gray-500">
            {data.completedTasks}/{data.totalTasks}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="radial-progress text-info"
          style={{ "--value": calculatePercentage(data.completedQuizzes, data.totalQuizzes) }}>
          {calculatePercentage(data.completedQuizzes, data.totalQuizzes)}%
        </div>
        <div>
          <div className="font-medium">Тесты</div>
          <div className="text-sm text-gray-500">
            {data.completedQuizzes}/{data.totalQuizzes}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulesPage;