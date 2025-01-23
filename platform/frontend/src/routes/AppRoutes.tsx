import App from "../App";
import Courses from "../pages/Courses";
import TaskPage from "../pages/Task";
import { createBrowserRouter } from 'react-router-dom';
import React from "react";
import HomePage from "../pages/Home";
import AdminPanel from "../pages/Admin";
import OAuthCallback from "../pages/OAuthCallback";
import ProtectedRoute from "./ProtectedRoute";
import { useNavigate } from "react-router-dom";
import ModulesPage from "../pages/Modules";

function Error404() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-base-200 p-4">
            <div className="mockup-code w-full max-w-2xl p-4 bg-base-100">
                <pre data-prefix="$">
                    <code>Ошибка 404: Страница не найдена</code>
                </pre>
                <pre data-prefix=">" className="text-warning">
                    <code>Проверьте правильность URL или вернитесь на главную страницу.</code>
                </pre>
                <pre data-prefix=">" className="text-success">
                    <code>Загрузка командной строки завершена.</code>
                </pre>
            </div>
            <button
                className="btn btn-primary mt-6"
                onClick={() => navigate("/")} // Перенаправление на главную страницу
            >
                Вернуться на главную
            </button>
        </div>
    );
};



const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        errorElement: <Error404 />,
        children: [
            {
                path: '',
                element: <HomePage />,
            },
            {
                path: 'courses',
                element: <ProtectedRoute><Courses /></ProtectedRoute>,
            },
            {
                path: 'course/:name',
                element: <ProtectedRoute><ModulesPage /></ProtectedRoute>,
            },
            {
                path: 'task/:name',
                element: <ProtectedRoute><TaskPage /></ProtectedRoute>,
            },
            // {
            //     path: 'admin',
            //     element: <ProtectedRoute><AdminPanel /></ProtectedRoute>,
            // },
        ],
    },
    {
        path: "/oauth/callback",
        element: <OAuthCallback />,
    },
    
]);

export default router;
