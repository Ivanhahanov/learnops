import React, { useState } from 'react';
import { useAuth } from "../context/OAuthContext";
import { sendOAuthRequest } from '../services/AuthService';
import { Navigate } from "react-router-dom";

const HomePage = () => {
    const { user } = useAuth();
    if (user?.id_token) {
        return <Navigate to='/courses' replace />;
    }
    const [loading, setLoading ] = useState(false)
    const loginHandler = async () => {
        setLoading(true)
        await sendOAuthRequest()
    }

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Левая часть: лендинг */}
            <div className="flex-[1.7_2] bg-base-200 flex items-center justify-center">

                <div className="max-w-4xl p-8">

                    <h1 className="text-5xl font-bold mb-6">Интерактивная IT-платформа</h1>
                    <p className="text-lg mb-8">
                        Платформа для обучения IT и ИБ-специалистов. Получите доступ к среде, которая позволяет учиться на реальных задачах.
                    </p>

                    {/* Карточки с информацией */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="card bg-base-100 shadow-lg p-4">
                            <h2 className="text-xl font-semibold">Автоматическое развертывание</h2>
                            <p className="text-sm">
                                Мы предоставляем готовую инфраструктуру для выполнения заданий.
                            </p>
                        </div>
                        <div className="card bg-base-100 shadow-lg p-4">
                            <h2 className="text-xl font-semibold">Реальные сценарии</h2>
                            <p className="text-sm">
                                Выполняйте задания в окружении, которое имитирует реальный мир.
                            </p>
                        </div>
                        <div className="card bg-base-100 shadow-lg p-4">
                            <h2 className="text-xl font-semibold">Отчеты и аналитика</h2>
                            <p className="text-sm">
                                Получайте подробные отчеты об обучении и прогрессе.
                            </p>
                        </div>
                        <div className="card bg-base-100 shadow-lg p-4">
                            <h2 className="text-xl font-semibold">Безопасная среда</h2>
                            <p className="text-sm">
                                Ваша работа проходит в изолированной и безопасной инфраструктуре.
                            </p>
                        </div>
                    </div>

                    {/* Кнопка перехода к документации */}
                    <button className="btn btn-primary">
                        <a href="/docs" target="_blank" rel="noopener noreferrer">
                            Перейти к документации
                        </a>
                    </button>
                </div>
            </div>

            {/* Правая часть: авторизация */}
            <div className="flex-1 bg-base-100 flex items-center justify-center">
                <div className="w-full max-w-md p-6 border border-gray-500 shadow-xl rounded-lg text-center">
                    <h2 className="text-3xl font-semibold mb-6">Вход в систему</h2>
                    <p className="text-sm mb-6">
                        Используйте вашу учетную запись.
                    </p>
                    {loading ?
                        <button className="btn btn-primary btn-block">
                            <span className="loading loading-spinner"></span>Redirecting
                        </button>
                        :
                        <button className="btn btn-primary btn-block" onClick={loginHandler}>Login via OIDC</button>

                    }
                </div>
            </div>
        </div>
    );
};

export default HomePage;