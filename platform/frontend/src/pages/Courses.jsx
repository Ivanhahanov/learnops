import { Link } from "react-router-dom";
import { useState, useEffect, useContext } from 'react'
import AuthContext from '../context/AuthContext';
import '../index.css'
import { useAuth } from "../context/OAuthContext";

const coursesData = [
    { id: 1, title: "React для начинающих", category: "Frontend", difficulty: "Beginner", tags: ["JavaScript", "React"] },
    { id: 2, title: "Основы Node.js", category: "Backend", difficulty: "Intermediate", tags: ["JavaScript", "Node.js"] },
    { id: 3, title: "Дизайн интерфейсов", category: "UI/UX", difficulty: "Beginner", tags: ["Design", "UI"] },
    { id: 4, title: "Python для анализа данных", category: "Data Science", difficulty: "Advanced", tags: ["Python", "Data Analysis"] },
    { id: 5, title: "Веб-разработка с Django", category: "Backend", difficulty: "Intermediate", tags: ["Python", "Django"] },
    { id: 6, title: "Базовый Linux", category: "Linux", difficulty: "Beginner", tags: ["Bash"] },
];


const Courses = () => {
    useAuth
    const { user } = useAuth();
    
    const [courses, setCourses] = useState([]);
    useEffect(() => {
        fetch("/api/courses", {
            headers: {
                'Authorization': 'Bearer ' + String(user.id_token)
            }
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setCourses(data);
            })
            .catch((err) => {
                console.log(err.message);
            });
    }, []);

    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedDifficulties, setSelectedDifficulties] = useState([]);

    const categories = ["Linux", "Frontend", "Backend", "UI/UX", "Data Science", ];
    const difficulties = ["Beginner", "Intermediate", "Advanced"];

    const toggleFilter = (filter, value, setter) => {
        setter((prev) =>
            prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
        );
    };

    const filteredCourses = courses.filter(
        (course) =>
            (selectedCategories.length === 0 || selectedCategories.includes(course.course.category)) &&
            (selectedDifficulties.length === 0 || selectedDifficulties.includes(course.course.difficulty))
    );

    const groupedCourses = categories.reduce((acc, category) => {
        const categoryCourses = filteredCourses.filter((course) => course.course.category === category);
        if (categoryCourses.length > 0) {
            acc[category] = categoryCourses;
        }
        return acc;
    }, {});

    return (
        <div className="container mx-auto p-6">
        
        <div className="flex ">
            {/* Боковая панель с фильтрами */}
            <div className="w-1/5 p-4">
                <h2 className="text-lg font-semibold mb-4">Фильтры</h2>

                {/* Фильтр по категориям */}
                <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Категории</h3>
                    {categories.map((category) => (
                        <label key={category} className="block mb-2">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-primary mr-2"
                                checked={selectedCategories.includes(category)}
                                onChange={() => toggleFilter(selectedCategories, category, setSelectedCategories)}
                            />
                            {category}
                        </label>
                    ))}
                </div>

                {/* Фильтр по уровню сложности */}
                <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Сложность</h3>
                    {difficulties.map((difficulty) => (
                        <label key={difficulty} className="block mb-2">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-primary mr-2"
                                checked={selectedDifficulties.includes(difficulty)}
                                onChange={() => toggleFilter(selectedDifficulties, difficulty, setSelectedDifficulties)}
                            />
                            {difficulty}
                        </label>
                    ))}
                </div>

            </div>

            {/* Основной контент с карточками курсов */}
            <main className="w-3/4 p-4">
                <h1 className="text-2xl font-bold mb-4">Курсы</h1>

                {Object.keys(groupedCourses).map((category) => (
                    
                    <div key={category} className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">{category}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {groupedCourses[category].map((course) => (
                                <Link to={`/course/${course.course.urlId}`}>
                                <div key={course.course.urlId} className="card bg-base-200 shadow p-4">
                                    <h3 className="text-lg font-semibold mb-2">{course.course.title}</h3>
                                    <p className="text-sm text-gray-500 mb-2">Категория: {course.course.category}</p>
                                    <p className="text-sm text-gray-500 mb-2">Сложность: {course.course.difficulty}</p>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {course.course.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="badge badge-primary text-sm px-2 py-1"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    {/* <button className="btn btn-primary mt-4">Подробнее</button> */}
                                </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </main>
        </div>
        </div>
    );

}

function Course(props) {
    return (
        <Link to={`/tasks/${props.id}`}>
            <div className="card bg-base-200 card-side shadow hover:shadow-accent hover:bg-base-300 rounded-xl">
                <div className="card-body">
                    <h2 className="card-title text-accent font-mono">{props.name}</h2>
                    <p className="">{props.description}</p>
                </div>
            </div>
        </Link>
    )
}

export default Courses