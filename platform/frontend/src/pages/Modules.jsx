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
        const total = module.data.length;
        const completed = module.data.filter((row) => row.completed).length
        return Math.round((completed / total) * 100);
    };

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
                                    className="mb-3 p-4 border border-base-300 bg-base-100 rounded-md shadow"
                                >
                                    <div className="flex justify-between items-center flex-wrap gap-4">
                                        <h2 className="text-lg font-bold flex-grow truncate">{module.title}</h2>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-4 text-sm font-medium">
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
                                            {module.data.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center p-4 rounded-md border border-base-300 shadow bg-base-100"
                                                >
                                                    <div
                                                        className={`indicator ${item.completed ? "bg-blue-500" : "bg-gray-300"
                                                            } w-3 h-3 rounded-full mr-4`}
                                                    ></div>
                                                    <div className="flex flex-grow items-center gap-1">
                                                        {item.type === "task" && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
                                                            </svg>
                                                        )}
                                                        {item.type === "lecture" && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                                            </svg>
                                                        )}
                                                        {item.type === "quiz" && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                            </svg>
                                                        )}
                                                        <span>{item.title}</span>
                                                    </div>
                                                    {item.type === "lecture" && (
                                                        <>
                                                            <button
                                                                onClick={() => openLectureModal(item.id)}
                                                                className="btn btn-sm btn-primary w-24"
                                                            >
                                                                Открыть
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
                                                            <button className="btn btn-sm btn-accent w-24">
                                                                Перейти
                                                            </button>
                                                        </TaskLink>
                                                    )}
                                                    {item.type === "quiz" && (
                                                        <>
                                                            <button
                                                                onClick={() => openTestModal(item.id)}
                                                                className="btn btn-sm btn-info w-24"
                                                            >
                                                                Пройти
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
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (<p className="text-center text-gray-500 mt-8">Нет модулей по выбранным фильтрам.</p>)
                    }
                </div>
            </div>

            {/* Правая часть: Аналитика */}
            <div className="col-span-4">
                <CourseProgressStat modules={modules} />
            </div>
        </div>
    );
};
export default ModulesPage;

const CourseProgressStat = ({ modules }) => {
    const data = modules.reduce(
        (acc, module) => {
            // Обновляем количество завершенных и общих модулей
            if (module.completed) acc.completedModules++;

            // Обновляем статистику по лекциям
            acc.totalLectures += module.data.filter((row) => row.type === "lecture").length;
            acc.completedLectures += module.data.filter((row) => row.type === "lecture" && row.completed).length;

            // Обновляем статистику по заданиям
            acc.totalTasks += module.data.filter((row) => row.type === "task").length;
            acc.completedTasks += module.data.filter((row) => row.type === "task" && row.completed).length;

            // Обновляем статистику по тестам
            acc.totalQuizzes += module.data.filter((row) => row.type === "quiz").length;
            acc.completedQuizzes += module.data.filter((row) => row.type === "quiz" && row.completed).length;

            return acc;
        },
        {
            completedModules: 0,
            totalLectures: 0,
            completedLectures: 0,
            totalTasks: 0,
            completedTasks: 0,
            totalQuizzes: 0,
            completedQuizzes: 0,
        }
    );
    data.totalModules = modules.length;
    const calculatePercentage = (completed, total) =>
        total === 0 ? 0 : Math.round((completed / total) * 100);

    return (
        <div className="stats shadow border border-base-300">

            {/* Прогресс по лекциям */}
            <div className="stat place-items-center">
                <div className="stat-title">Лекции</div>
                <div className="stat-value text-primary">
                    {data.completedLectures}/{data.totalLectures}
                </div>
                <div className="stat-desc">
                    {calculatePercentage(data.completedLectures, data.totalLectures)}% завершено
                </div>
            </div>
            {/* Прогресс по заданиям */}
            <div className="stat place-items-center">
                <div className="stat-title">Задания</div>
                <div className="stat-value text-accent">
                    {data.completedTasks}/{data.totalTasks}
                </div>
                <div className="stat-desc">
                    {calculatePercentage(data.completedTasks, data.totalTasks)}% завершено
                </div>
            </div>

            {/* Прогресс по тестам */}
            <div className="stat place-items-center">
                {/* <div class="stat-figure text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                        </svg>
                    </div> */}
                <div className="stat-title">Тесты</div>
                <div className="stat-value text-info">
                    {data.completedQuizzes}/{data.totalQuizzes}
                </div>
                <div className="stat-desc">
                    {calculatePercentage(data.completedQuizzes, data.totalQuizzes)}% завершено
                </div>
            </div>
        </div>
    );
};