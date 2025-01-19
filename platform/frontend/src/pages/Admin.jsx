import React, { useState } from "react";

function AdminPanel() {
  const [users, setUsers] = useState([]); // Список пользователей
  const [courses, setCourses] = useState([]); // Список курсов

  const handleAddUser = () => {
    // Логика для добавления нового пользователя
    const newUser = { id: Date.now(), name: "Новый пользователь", activity: "Активен" };
    setUsers([...users, newUser]);
  };

  const handleDeleteUser = (id) => {
    // Логика для удаления пользователя
    setUsers(users.filter((user) => user.id !== id));
  };

  const handleAddCourse = () => {
    // Логика для добавления нового курса
    const newCourse = { id: Date.now(), title: "Новый курс", students: 0 };
    setCourses([...courses, newCourse]);
  };

  const handleDeleteCourse = (id) => {
    // Логика для удаления курса
    setCourses(courses.filter((course) => course.id !== id));
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Админ-панель образовательной платформы</h1>

      <div className="tabs">
        <div className="tab tab-bordered">Управление пользователями</div>
        <div className="tab tab-bordered">Управление курсами</div>
        <div className="tab tab-bordered">Статистика</div>
      </div>

      <div className="mt-6">
        {/* Управление пользователями */}
        <div className="card bg-white shadow-md p-4 mb-6">
          <h2 className="text-xl font-bold mb-4">Управление пользователями</h2>
          <button className="btn btn-primary mb-4" onClick={handleAddUser}>
            Добавить пользователя
          </button>
          <ul className="list-disc pl-5">
            {users.map((user) => (
              <li key={user.id} className="mb-2 flex justify-between">
                <span>{user.name}</span>
                <button
                  className="btn btn-error btn-sm"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Управление курсами */}
        <div className="card bg-white shadow-md p-4 mb-6">
          <h2 className="text-xl font-bold mb-4">Управление курсами</h2>
          <button className="btn btn-primary mb-4" onClick={handleAddCourse}>
            Добавить курс
          </button>
          <ul className="list-disc pl-5">
            {courses.map((course) => (
              <li key={course.id} className="mb-2 flex justify-between">
                <span>{course.title}</span>
                <button
                  className="btn btn-error btn-sm"
                  onClick={() => handleDeleteCourse(course.id)}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Статистика */}
        <div className="card bg-white shadow-md p-4">
          <h2 className="text-xl font-bold mb-4">Статистика</h2>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Количество пользователей</div>
              <div className="stat-value">{users.length}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Количество курсов</div>
              <div className="stat-value">{courses.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
