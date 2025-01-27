import { Link } from "react-router-dom";
import { useState, useEffect, useContext } from 'react'
import '../index.css'
import { useAuth } from "../context/OAuthContext";
import CourseCard from "../components/CourseCard";


const Courses = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedDifficulties, setSelectedDifficulties] = useState([]);
    const [statusFilter, setStatusFilter] = useState(null); // null - все, "completed" - выполненные, "in_progress" - в процессе, "not_started" - не начатые

    useEffect(() => {
        fetch("/api/courses", {
            headers: {
                Authorization: "Bearer " + String(user.id_token),
            },
        })
            .then((res) => res.json())
            .then((data) => setCourses(data))
            .catch((err) => console.error(err.message));
    }, [user.id_token]);

    const categories = [...new Set(courses.map(course => course.category))];
    const difficulties = [...new Set(courses.map(course => course.difficulty))];

    // Общий метод для переключения фильтров
    const toggleFilter = (filter, value, setter) => {
        setter((prev) =>
            prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
        );
    };

    // Фильтрация курсов по выбранным фильтрам
    const filteredCourses = courses.filter((course) => {
        const matchesCategory =
            selectedCategories.length === 0 || selectedCategories.includes(course.category);
        const matchesDifficulty =
            selectedDifficulties.length === 0 || selectedDifficulties.includes(course.difficulty);

        let matchesStatus = true;

        // Фильтрация по статусу выполнения (все, выполненные, в процессе, не начатые)
        if (statusFilter === "completed") {
            matchesStatus = course.is_started && course.is_completed;
        } else if (statusFilter === "in_progress") {
            matchesStatus = course.is_started && !course.is_completed;
        } else if (statusFilter === "not_started") {
            matchesStatus = !course.is_started;
        }

        return matchesCategory && matchesDifficulty && matchesStatus;
    });

    const groupedCourses = categories.reduce((acc, category) => {
        const categoryCourses = filteredCourses.filter((course) => course.category === category);
        if (categoryCourses.length > 0) {
            acc[category] = categoryCourses;
        }
        return acc;
    }, {});

    return (
        <div className="container mx-auto p-6">
            <div className="flex">
                {/* Боковая панель с фильтрами */}
                <div className="w-1/5 p-4">
                    <h2 className="text-lg font-semibold mb-4">Фильтры</h2>
                    <div className="card bg-base-100 shadow border border-base-300 p-4">
                        {/* Фильтр по категориям */}
                        <FilterSection
                            title="Категории"
                            options={categories}
                            selectedOptions={selectedCategories}
                            onToggle={(category) =>
                                toggleFilter(selectedCategories, category, setSelectedCategories)
                            }
                        />

                        {/* Фильтр по уровню сложности */}
                        <FilterSection
                            title="Сложность"
                            options={difficulties}
                            selectedOptions={selectedDifficulties}
                            onToggle={(difficulty) =>
                                toggleFilter(selectedDifficulties, difficulty, setSelectedDifficulties)
                            }
                        />

                        {/* Фильтр по статусу выполнения */}
                        <div className="mb-4">
                            <h3 className="text-sm font-medium mb-2">Статус выполнения</h3>
                            {[
                                { label: "Все", value: null },
                                { label: "Выполненные", value: "completed" },
                                { label: "В процессе", value: "in_progress" },
                                { label: "Не начатые", value: "not_started" },
                            ].map((status, index) => (
                                <label
                                    key={`status-${index}`} // Уникальный ключ
                                    className="flex items-center mb-2 space-x-2"
                                >
                                    <input
                                        type="radio"
                                        className="radio radio-primary"
                                        checked={statusFilter === status.value}
                                        onChange={() => setStatusFilter(status.value)}
                                    />
                                    <span>{status.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Основной контент с карточками курсов */}
                <main className="w-4/5 p-4">
                    <h1 className="text-2xl font-bold mb-4">Курсы</h1>

                    {Object.keys(groupedCourses).map((category) => (
                        <div key={category} className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">{category}</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-1 2xl:grid-cols-3 gap-4">
                                {groupedCourses[category].map((course, index) => (
                                    <div key={index}>
                                        <CourseCard course={course}></CourseCard>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {filteredCourses.length === 0 && (
                        <p className="text-center text-gray-500 mt-8">Нет курсов по выбранным фильтрам.</p>
                    )}
                </main>
            </div>
        </div>
    );
};

const FilterSection = ({ title, options, selectedOptions, onToggle }) => (
    <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">{title}</h3>
        {options.map((option, index) => (
            <label
                key={`${title}-${index}`} // Уникальный ключ
                className="flex items-center mb-2 space-x-2"
            >
                <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={selectedOptions.includes(option)}
                    onChange={() => onToggle(option)}
                />
                <span>{option}</span>
            </label>
        ))}
    </div>
);

export default Courses;
