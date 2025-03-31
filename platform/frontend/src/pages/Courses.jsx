import { useState, useEffect } from 'react'
import '../index.css'
import { useAuth } from "../context/OAuthContext";
import CourseCard from "../components/CourseCard";


const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);



  // Сбрасываем на первую страницу при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedDifficulties, statusFilter]);


  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleMediaChange = (e) => {
      setIsFiltersOpen(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

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

  const pageStart = (currentPage - 1) * itemsPerPage;
  const paginatedCourses = filteredCourses.slice(pageStart, pageStart + itemsPerPage);
  // Вычисляем общее количество страниц
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  // Генерируем массив номеров страниц
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const groupedCourses = categories.reduce((acc, category) => {
    const categoryCourses = paginatedCourses.filter((course) => course.category === category);
    if (categoryCourses.length > 0) {
      acc[category] = categoryCourses;
    }
    return acc;
  }, {});

  return (
    <div className="container p-4 md:p-6 mx-auto max-w-7xl">
      {/* Кнопка для мобильных устройств */}
      <button
        className="btn btn-primary btn-sm mb-4 md:hidden"
        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
      >
        {isFiltersOpen ? 'Скрыть фильтры' : 'Фильтры'}
      </button>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Боковая панель с фильтрами */}
        <div className={`w-full md:w-1/4 transition-all ${isFiltersOpen ? 'block' : 'hidden'} md:block`}>
          <div className="card bg-base-100 shadow-xl p-4 sticky top-4">
            <h2 className="text font-semibold mb-4">Фильтры</h2>
            {/* <div className="card bg-base-100 shadow border border-base-300 p-4"> */}
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
            {/* </div> */}
          </div>
        </div>

        {/* Основной контент с карточками курсов */}
        <main className="w-full md:w-3/4">
          <h1 className="text-3xl font-bold mb-6">Курсы</h1>

          {Object.keys(groupedCourses).map((category) => (
            <div key={category} className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedCourses[category].map((course, index) => (
                  <CourseCard key={index} course={course} />
                ))}
              </div>
            </div>
          ))}

          {filteredCourses.length === 0 && (
            <p className="text-center text-gray-500 mt-8">Нет курсов по выбранным фильтрам.</p>
          )}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="join">
                {pageNumbers.map((page) => (
                  <input
                    key={page}
                    className="join-item btn btn-sm btn-square"
                    type="radio"
                    name="options"
                    aria-label={String(page)}
                    checked={currentPage === page}
                    onChange={() => setCurrentPage(page)}
                  />
                ))}
              </div>
            </div>
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
