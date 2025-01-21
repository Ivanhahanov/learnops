import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import LectureModal from "../components/LectureModal";
import QuizModal from '../components/QuizModal';
import { useAuth } from '../context/OAuthContext';

const CourseDashboard = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [lectures, setLectures] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [tests, setTests] = useState([]);
    const [selectedTest, setSelectedTest] = useState(null);
    const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const questions = [
        { id: 1, text: "Что такое HTTP?", type: "choice", options: ["Протокол передачи гипертекста", "Язык программирования"] },
        { id: 2, text: "Объясните разницу между HTTP и HTTPS.", type: "text" },
        { id: 3, text: "Является ли SQL инъекция уязвимостью?", type: "true-false" }
    ];

    // Simulating API call
    useEffect(() => {
        fetch(`/api/course/${id}`, {
            headers: {
                'Authorization': 'Bearer ' + user.id_token
            }
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setTasks(data.tasks)
                setLectures(data.lectures)
                setMaterials(data.materials)
                setTests(data.tests)
                setIsLoading(false)
            })
            .catch((err) => {
                console.log(err.message);
            });
    }, []);

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


    const handleSubmitTest = () => {
        alert('Тест сдан!');
        setTests(tests.map(t => t.title === selectedTest.title ? { ...t, status: 'Пройден' } : t));
        closeModal();
    };


    const totalTasks = tasks.length
    const completedTasks = tasks.filter(a => a.status === 'Выполнено').length;
    const remainingTasks = totalTasks - completedTasks;
    const progressPercentage = Math.round((completedTasks / totalTasks) * 100);
    const passedTests = tests.filter(t => t.status === 'Пройден').length;

    const Skeleton = () => (
        <div className="flex w-52 flex-col gap-4">
            <div className="skeleton h-32 w-full"></div>
        </div>
    );

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-primary">[Basic] Linux</h1>

            <div className="grid grid-cols-12 gap-6">
                {/* Левая колонка */}
                <div className="col-span-3">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold mb-4">Лекции</h2>
                        {isLoading ? (
                            <Skeleton />
                        ) : (
                            lectures.map((lecture, index) => (
                                <div key={index} className="card shadow-lg border border-gray-500 rounded-md mb-4">
                                    <div className="card-body">
                                        <h3 className="card-title">{lecture.title}<div className="badge">New</div></h3>
                                        <p>{lecture.description}</p>
                                        <div className="card-actions justify-start">
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => openLectureModal(`lecture-${index}`)}
                                            >
                                                Открыть
                                            </button>
                                        </div>
                                        <LectureModal
                                            modalId={`lecture-${index}`}
                                            markdownContent={lecture.text}
                                            isOpen={lectureModalStates[`lecture-${index}`] || false}
                                            onClose={() => closeLectureModal(`lecture-${index}`)}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xl font-bold mb-4">Полезные материалы</h2>
                        {isLoading ? (
                            <Skeleton />
                        ) : (
                            materials.map((material, index) => (
                                <div key={index} className="card shadow-lg border border-gray-500 rounded-md mb-4">
                                    <div className="card-body">
                                        <h3 className="card-title">{material.title}</h3>
                                        <a href={material.link} className="link link-primary" target="_blank" rel="noopener noreferrer">Открыть</a>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Средняя колонка */}
                <div className="col-span-6">
                    <div className="stats stats-horizontal border border-gray-500 shadow-lg mb-6 flex ">
                        <div className="stat">
                            <div className="stat-title">Всего заданий</div>
                            <div className="stat-value">{totalTasks}</div>
                        </div>
                        <div className="stat">
                            <div className="stat-title">Выполнено</div>
                            <div className="stat-value">{completedTasks}</div>
                        </div>
                        <div className="stat">
                            <div className="stat-title">Осталось</div>
                            <div className="stat-value">{remainingTasks}</div>
                        </div>
                        <div className="stat">
                            <div className="stat-title">Пройдено тестов</div>
                            <div className="stat-value">{passedTests}</div>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold mb-4">Задания</h2>
                    {isLoading ? (
                        <Skeleton />
                    ) : (
                        tasks.map((task, index) => (
                            <Link to={`/task/${task.urlId}`}>
                                <div key={index} className="card shadow-lg border border-gray-500 rounded-md mb-4 cursor-pointer">
                                    <div className="card-body">
                                        <h3 className="card-title">{task.title}
                                            <span className={`badge ${task.status === 'Completed' ? 'badge-success' :
                                                task.status === 'InProgress' ? 'badge-warning' :
                                                    ''
                                                }`}>{task.status}</span>
                                        </h3>
                                        <p>{task.description}</p>

                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                {/* Правая колонка */}
                <div className="col-span-3">
                    <h2 className="text-xl font-bold mb-4">Тесты</h2>
                    {isLoading ? (
                        <Skeleton />
                    ) : (
                        tests.map((test, index) => (
                            <div key={index} className="card shadow-lg border border-gray-500 mb-4 rounded-md">
                                <div className="card-body">

                                    <h3 className="card-title">{test.title}
                                        <span className={`badge ${test.status === 'Пройден' ? 'badge-success' : ''
                                            }`}>{test.status || "New"}</span>
                                    </h3>
                                    <p>{test.description}</p>
                                    <div className="card-actions justify-start">
                                        <button
                                            onClick={() => openTestModal(`quiz-${index}`)}
                                            className="btn btn-sm btn-primary"
                                        >
                                            Пройти тест
                                        </button>
                                    </div>
                                    <QuizModal
                                        modalId={`quiz-${index}`}
                                        questions={test.questions}
                                        isOpen={testModalStates[`quiz-${index}`] || false}
                                        onClose={() => closeTestModal(`quiz-${index}`)}
                                    />

                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
export default CourseDashboard;
