import React, { useState, useEffect } from "react";
import LectureModal from "../components/LectureModal";
import QuizModal from "../components/QuizModal";
import { useAuth } from "../context/OAuthContext";
import { useParams, useLocation } from "react-router-dom";
import TaskLink from "../components/TaskLink";

const ModulesPage = () => {
    const { user } = useAuth()
    const [modules, setModules] = useState([])
    const [expandedModules, setExpandedModules] = useState({});
    const [allExpanded, setAllExpanded] = useState(false);
    const { name } = useParams();

    const location = useLocation();

    const fetchModules = async () => {
        try {
            const response = await fetch(`/api/course/${name}`, {
                headers: {
                    'Authorization': 'Bearer ' + user.id_token
                }
            }) // Замените на ваш API
            const data = await response.json();
            setModules(data);
            // Инициализируем состояние развернутости для всех модулей
            const initialExpandedState = data.reduce((acc, module) => {
                acc[module.id] = false; // Все модули изначально свернуты
                return acc;
            }, {});
            setExpandedModules(initialExpandedState);
        } catch (error) {
            console.error("Ошибка при загрузке данных:", error);
        }
    };
    // hack: if use navigate(-1) reload modules info
    useEffect(() => {
        console.log('update')
        fetchModules();
    }, [location.state]);

    const [filter, setFilter] = useState("all");

    const filteredModules =
        filter === "all"
            ? modules
            : modules.filter((module) =>
                filter === "completed"
                    ? module.completed
                    : !module.completed
            );

    // Обработчик для разворачивания одного модуля
    const toggleModule = (id) => {
        setExpandedModules((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Обработчик для кнопки "Развернуть всё"
    const toggleAllModules = () => {
        const newExpandedState = !allExpanded;

        // Создаем новое состояние для всех модулей на основе данных `modules`
        const updatedState = modules.reduce((acc, module) => {
            acc[module.id] = newExpandedState;
            return acc;
        }, {});
        console.log(updatedState, newExpandedState)

        setExpandedModules(updatedState);
        setAllExpanded(newExpandedState);
    };


    const calculateProgress = (module) => {
        const total = module.lectures.length + module.tasks.length + module.quizzes.length;
        const completed =
            module.lectures.filter((l) => l.completed).length +
            module.tasks.filter((task) => task.completed).length +
            module.quizzes.filter((q) => q.completed).length;
        return Math.round((completed / total) * 100);
    };

    const data = modules.reduce(
        (acc, module) => {
            // Обновляем количество завершенных и общих модулей
            if (module.completed) acc.completedModules++;

            // Обновляем статистику по лекциям
            acc.totalLectures += module.lectures.length;
            acc.completedLectures += module.lectures.filter((lecture) => lecture.completed).length;

            // Обновляем статистику по заданиям
            acc.totalTasks += module.tasks.length;
            acc.completedTasks += module.tasks.filter((task) => task.completed).length;

            // Обновляем статистику по тестам
            acc.totalTests += module.quizzes.length;
            acc.completedTests += module.quizzes.filter((quiz) => quiz.completed).length;

            return acc;
        },
        {
            completedModules: 0,
            totalLectures: 0,
            completedLectures: 0,
            totalTasks: 0,
            completedTasks: 0,
            totalTests: 0,
            completedTests: 0,
        }
    );
    data.totalModules = modules.length;

    const [testModalStates, setTestModalStates] = useState({});
    const openTestModal = (modalId) => {
        setTestModalStates((prev) => ({ ...prev, [modalId]: true }));
    };

    const closeTestModal = (modalId) => {
        setTestModalStates((prev) => ({ ...prev, [modalId]: false }));
    };


    const [lectureModalStates, setLectureModalStates] = useState({});
    const openLectureModal = (modalId) => {
        setLectureModalStates((prev) => ({ ...prev, [modalId]: true }));
    };

    const closeLectureModal = (modalId) => {
        setLectureModalStates((prev) => ({ ...prev, [modalId]: false }));
    };

    return (
        <div className="container mx-auto py-6 grid grid-cols-12 gap-6">
            {/* Левая часть: Темы */}
            <div className="col-span-8">
                {/* Приветствие */}
                <div className="mb-6 p-4 bg-primary text-white rounded-md">
                    <h1 className="text-2xl font-bold">Добро пожаловать на курс!</h1>
                    <p className="text-sm">Начнем изучение тем и выполнения заданий!</p>
                </div>

                {/* Фильтры и кнопка "Развернуть всё" */}
                <div className="mb-6 flex gap-4 items-center">
                    <div className="flex gap-2">
                        <button
                            className={`btn btn-xs ${filter === "all" ? "btn-primary" : "btn-outline"
                                }`}
                            onClick={() => setFilter("all")}
                        >
                            Все
                        </button>
                        <button
                            className={`btn btn-xs ${filter === "completed" ? "btn-primary" : "btn-outline"
                                }`}
                            onClick={() => setFilter("completed")}
                        >
                            Выполненные
                        </button>
                        <button
                            className={`btn btn-xs ${filter === "incomplete" ? "btn-primary" : "btn-outline"
                                }`}
                            onClick={() => setFilter("incomplete")}
                        >
                            Невыполненные
                        </button>
                    </div>
                    <button
                        className="btn btn-xs btn-secondary ml-auto w-32"
                        onClick={toggleAllModules}
                    >
                        {allExpanded ? "Свернуть всё" : "Развернуть всё"}
                    </button>
                </div>

                {/* Темы */}
                <div>
                    {filteredModules.map((module) => {
                        const progress = calculateProgress(module);
                        const completedTasks = module.tasks.filter((t) => t.completed).length;
                        const completedLectures = module.lectures.filter((l) => l.completed).length;
                        const completedQuizzes = module.quizzes.filter((q) => q.completed).length;
                        const totalTasks = module.tasks.length;
                        const totalLectures = module.lectures.length;
                        const totalQuizzes = module.quizzes.length;

                        return (
                            <div
                                key={module.id}
                                className="mb-6 p-4 border border-gray-300 rounded-md  shadow"
                            >
                                <div className="flex justify-between items-center flex-wrap gap-4">
                                    <h2 className="text-lg font-bold flex-grow truncate">{module.title}</h2>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-4 text-sm font-medium">
                                            <div className="flex items-center gap-1">
                                                <span className="text-xl">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
                                                    </svg>

                                                </span>
                                                <span>
                                                    {completedTasks}/{totalTasks}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xl">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                                    </svg>

                                                </span>
                                                <span>
                                                    {completedLectures}/{totalLectures}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xl">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                    </svg>
                                                </span>
                                                <span>
                                                    {completedQuizzes}/{totalQuizzes}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-32">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-sm btn-outline w-24"
                                        onClick={() => toggleModule(module.id)}
                                    >
                                        {expandedModules[module.id] ? "Свернуть" : "Развернуть"}
                                    </button>
                                </div>

                                {expandedModules[module.id] && (
                                    <div className="mt-4 space-y-2">
                                        {module.lectures.map((lecture, lectureIndex) => (
                                            <div
                                                key={lectureIndex}
                                                className="flex items-center p-4 rounded-md border shadow">
                                                <div
                                                    className={`indicator ${lecture.completed ? "bg-blue-500" : "bg-gray-300"
                                                        } w-3 h-3 rounded-full mr-4`}
                                                ></div>
                                                <div className="flex flex-grow items-center gap-1">
                                                    <span className="text-xl">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                                        </svg>
                                                    </span>
                                                    <span>
                                                        {lecture.title}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => openLectureModal(lecture.id)}
                                                    className="btn btn-sm btn-primary w-24">
                                                    Открыть
                                                </button>

                                                <LectureModal
                                                    lectureId={lecture.id}
                                                    isOpen={lectureModalStates[lecture.id] || false}
                                                    onClose={() => closeLectureModal(lecture.id)}
                                                    setModules={setModules}
                                                />
                                            </div>
                                        ))}
                                        {module.tasks.map((task, taskIndex) => (
                                            <div
                                                key={taskIndex}
                                                className="flex items-center p-4 rounded-md border shadow"
                                            >
                                                <div
                                                    className={`indicator ${task.completed ? "bg-blue-500" : "bg-gray-300"
                                                        } w-3 h-3 rounded-full mr-4`}
                                                ></div>
                                                {/* <svg role="img" className="h-4 w-4" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" version="1.1" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect height="10.5" width="12.5" y="2.75" x="1.75"></rect> <path d="m8.75 10.25h2.5m-6.5-4.5 2.5 2.25-2.5 2.25"></path> </g></svg> */}
                                                <div className="flex flex-grow items-center gap-1">
                                                    <span className="text-xl">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
                                                        </svg>

                                                    </span>
                                                    <span>
                                                        {task.title}
                                                    </span>
                                                </div>
                                                <TaskLink name={task.name} id={task.id}>
                                                    <button className="btn btn-sm btn-accent w-24">
                                                        Перейти
                                                    </button>
                                                </TaskLink>
                                            </div>
                                        ))}
                                        {module.quizzes.map((quiz, taskIndex) => (
                                            <div
                                                key={taskIndex}
                                                className="flex items-center p-4 rounded-md border shadow">
                                                <div
                                                    className={`indicator ${quiz.completed ? "bg-blue-500" : "bg-gray-300"
                                                        } w-3 h-3 rounded-full mr-4`}
                                                ></div>
                                                <div className="flex flex-grow items-center gap-1">
                                                    <span className="text-xl">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                        </svg>
                                                    </span>
                                                    <span>
                                                        {quiz.title}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => openTestModal(quiz.id)}
                                                    className="btn btn-sm btn-info w-24">
                                                    Пройти
                                                </button>
                                                <QuizModal
                                                    quizId={quiz.id}
                                                    isOpen={testModalStates[quiz.id] || false}
                                                    onClose={() => closeTestModal(quiz.id)}
                                                    setModules={setModules}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Правая часть: Аналитика */}
            <div className="col-span-4">
                <CourseProgressStat {...data} />
            </div>
        </div>
    );
};
export default ModulesPage;

const CourseProgressStat = ({
    completedModules,
    totalModules,
    completedLectures,
    totalLectures,
    completedTasks,
    totalTasks,
    completedTests,
    totalTests,
}) => {
    const calculatePercentage = (completed, total) =>
        total === 0 ? 0 : Math.round((completed / total) * 100);

    return (
        <div className="grid grid-cols-2 w-full max-w-4xl mx-auto shadow border rounded-md">
            {/* Прогресс по модулям */}
            <div className="stat flex flex-col items-start">
                <div className="flex items-center gap-4">
                    <div className="stat-figure text-secondary">

                    </div>
                    <div>
                        <div className="stat-title">Модули</div>
                        <div className="stat-value text-secondary">
                            {completedModules}/{totalModules}
                        </div>
                        <div className="stat-desc">
                            {calculatePercentage(completedModules, totalModules)}% завершено
                        </div>
                    </div>
                </div>
            </div>

            {/* Прогресс по лекциям */}
            <div className="stat flex flex-col items-start">
                <div className="flex items-center gap-4">
                    <div className="stat-figure text-primary">

                    </div>
                    <div>
                        <div className="stat-title">Лекции</div>
                        <div className="stat-value text-primary">
                            {completedLectures}/{totalLectures}
                        </div>
                        <div className="stat-desc">
                            {calculatePercentage(completedLectures, totalLectures)}% завершено
                        </div>
                    </div>
                </div>
            </div>

            {/* Прогресс по заданиям */}
            <div className="stat flex flex-col items-start">
                <div className="flex items-center gap-4">
                    <div className="stat-figure text-accent">

                    </div>
                    <div>
                        <div className="stat-title">Задания</div>
                        <div className="stat-value text-accent">
                            {completedTasks}/{totalTasks}
                        </div>
                        <div className="stat-desc">
                            {calculatePercentage(completedTasks, totalTasks)}% завершено
                        </div>
                    </div>
                </div>
            </div>

            {/* Прогресс по тестам */}
            <div className="stat flex flex-col items-start">
                <div className="flex items-center gap-4">
                    <div className="stat-figure text-info">

                    </div>
                    <div>
                        <div className="stat-title">Тесты</div>
                        <div className="stat-value text-info">
                            {completedTests}/{totalTests}
                        </div>
                        <div className="stat-desc">
                            {calculatePercentage(completedTests, totalTests)}% завершено
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};