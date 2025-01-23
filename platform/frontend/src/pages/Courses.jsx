import { Link } from "react-router-dom";
import { useState, useEffect, useContext } from 'react'
import '../index.css'
import { useAuth } from "../context/OAuthContext";
import CourseCard from "../components/CourseCard";

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

    // TODO: get from backend
    const categories = ["Linux", "Git", "Backend", "UI/UX", "Data Science",];
    const difficulties = ["Beginner", "Intermediate", "Advanced"];

    const toggleFilter = (filter, value, setter) => {
        setter((prev) =>
            prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
        );
    };

    const filteredCourses = courses.filter(
        (course) =>
            (selectedCategories.length === 0 || selectedCategories.includes(course.category)) &&
            (selectedDifficulties.length === 0 || selectedDifficulties.includes(course.difficulty))
    );

    const groupedCourses = categories.reduce((acc, category) => {
        const categoryCourses = filteredCourses.filter((course) => course.category === category);
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
                            <div className="grid grid-cols-2 sm:grid-cols-1 2xl:grid-cols-3 gap-4">
                                {groupedCourses[category].map((course) => (
                                    <div key={course.id}>
                                        <CourseCard course={course}></CourseCard>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </main>
            </div>
        </div>
    );

}

export default Courses