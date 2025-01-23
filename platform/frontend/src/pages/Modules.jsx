import React, { useState, useEffect } from "react";
import LectureModal from "../components/LectureModal";
import QuizModal from "../components/QuizModal";
import { useAuth } from "../context/OAuthContext";
import { useParams } from "react-router-dom";
import TaskLink from "../components/TaskLink";

const ModulesPage = () => {
    const { user } = useAuth()
    const [modules, setModules] = useState([])
    const [expandedModules, setExpandedModules] = useState({});
    const [allExpanded, setAllExpanded] = useState(false);
    const { name } = useParams();
    const fetchTopics = async () => {
        try {
            const response = await fetch(`/api/course/${name}`, {
                headers: {
                    'Authorization': 'Bearer ' + user.id_token
                }
            }) // Замените на ваш API
            const data = await response.json();
            // data[0].tasks[0].completed = true
            // data[0].lectures[0].completed = true
            setModules(data);
            console.log(data)
            // Инициализируем состояние развернутости для всех модулей
            const initialExpandedState = data.reduce((acc, topic) => {
                acc[topic.id] = false; // Все модули изначально свернуты
                return acc;
            }, {});
            setExpandedModules(initialExpandedState);
        } catch (error) {
            console.error("Ошибка при загрузке данных:", error);
        }
    };

    useEffect(() => {
        fetchTopics();
    }, []);

    const [filter, setFilter] = useState("all");

    const filteredTopics =
        filter === "all"
            ? modules
            : modules.filter((topic) =>
                filter === "completed"
                    ? topic.completed
                    : !topic.completed
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
        setExpandedModules((prev) => {
            const updatedState = {};
            Object.keys(prev).forEach((id) => {
                updatedState[id] = newExpandedState;
            });
            return updatedState;
        });
        setAllExpanded(newExpandedState);
    };


    const calculateProgress = (topic) => {
        const total = 1 + topic.tasks.length + (topic.quizzes ? 1 : 0);
        const completed =
            topic.lectures.filter((l) => l.completed).length +
            topic.tasks.filter((task) => task.completed).length +
            topic.quizzes.filter((q) => q.completed).length;
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
                    {filteredTopics.map((topic, index) => {
                        const progress = calculateProgress(topic);
                        const completedTasks = topic.tasks.filter((t) => t.completed).length;
                        const completedLectures = topic.lectures.filter((l) => l.completed).length;
                        const completedQuizzes = topic.quizzes.filter((q) => q.completed).length;
                        const totalTasks = topic.tasks.length;
                        const totalLectures = topic.lectures.length;
                        const totalQuizzes = topic.quizzes.length;


                        return (
                            <div
                                key={index}
                                className="mb-6 p-4 border border-gray-300 rounded-md  shadow"
                            >
                                <div className="flex justify-between items-center flex-wrap gap-4">
                                    <h2 className="text-xl font-bold flex-grow">{topic.title}</h2>
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm">
                                            ⚙️{completedTasks}/{totalTasks}{" "}
                                            📘{completedLectures}/{totalLectures}{" "}
                                            📝{completedQuizzes}/{totalQuizzes}{" "}
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
                                        onClick={() => toggleModule(index)}
                                    >
                                        {expandedModules[index] ? "Свернуть" : "Развернуть"}
                                    </button>
                                </div>

                                {expandedModules[index] && (
                                    <div className="mt-4 space-y-2">
                                        {topic.lectures.map((lecture, lectureIndex) => (
                                            <div
                                                key={lectureIndex}
                                                className="flex items-center p-4 rounded-md border shadow">
                                                <div
                                                    className={`indicator ${lecture.completed ? "bg-blue-500" : "bg-gray-300"
                                                        } w-3 h-3 rounded-full mr-4`}
                                                ></div>
                                                <span className="flex-grow text-sm">
                                                    📘 Лекция: {lecture.title}
                                                </span>
                                                <button
                                                    onClick={() => openLectureModal(lecture.id)}
                                                    className="btn btn-sm btn-primary w-24">
                                                    Открыть
                                                </button>

                                                <LectureModal
                                                    lectureId={lecture.id}
                                                    isOpen={lectureModalStates[lecture.id] || false}
                                                    onClose={() => closeLectureModal(lecture.id)}
                                                />
                                            </div>
                                        ))}
                                        {topic.tasks.map((task, taskIndex) => (
                                            <div
                                                key={taskIndex}
                                                className="flex items-center p-4 rounded-md border shadow"
                                            >
                                                <div
                                                    className={`indicator ${task.completed ? "bg-blue-500" : "bg-gray-300"
                                                        } w-3 h-3 rounded-full mr-4`}
                                                ></div>
                                                <span className="flex-grow text-sm">
                                                    {/* <svg role="img" className="h-4 w-4" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" version="1.1" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect height="10.5" width="12.5" y="2.75" x="1.75"></rect> <path d="m8.75 10.25h2.5m-6.5-4.5 2.5 2.25-2.5 2.25"></path> </g></svg> */}
                                                    ⚙️ Задание: {task.title}
                                                </span>
                                                <TaskLink name={task.name} id={task.id}>
                                                    <button className="btn btn-sm btn-accent w-24">
                                                        Перейти
                                                    </button>
                                                </TaskLink>
                                            </div>
                                        ))}
                                        {topic.quizzes.map((quiz, taskIndex) => (
                                            <div
                                                key={taskIndex}
                                                className="flex items-center p-4 rounded-md border shadow">
                                                <div
                                                    className={`indicator ${quiz.completed ? "bg-blue-500" : "bg-gray-300"
                                                        } w-3 h-3 rounded-full mr-4`}
                                                ></div>
                                                <span className="flex-grow text-sm">
                                                    📝 {quiz.title}
                                                </span>
                                                <button
                                                    onClick={() => openTestModal(quiz.id)}
                                                    className="btn btn-sm btn-info w-24">
                                                    Пройти
                                                </button>
                                                <QuizModal
                                                    quizId={quiz.id}
                                                    isOpen={testModalStates[quiz.id] || false}
                                                    onClose={() => closeTestModal(quiz.id)}
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