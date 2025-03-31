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
        <div className="flex flex-col md:flex-row md:h-[calc(100vh-4rem)]">
            {/* Левая часть: лендинг */}
            <div className="md:flex-[1.7_2] bg-base-200 flex items-center justify-center p-4 md:p-8 order-2 md:order-1">
                <div className="max-w-4xl w-full">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">Интерактивная IT-платформа</h1>
                    <p className="text-base md:text-lg mb-6 md:mb-8">
                        Платформа для обучения IT и ИБ-специалистов. Получите доступ к среде, которая позволяет учиться на реальных задачах.
                    </p>

                    {/* Карточки с информацией */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                        {[
                            ['Автоматическое развертывание', 'Мы предоставляем готовую инфраструктуру для выполнения заданий.'],
                            ['Реальные сценарии', 'Выполняйте задания в окружении, которое имитирует реальный мир.'],
                            ['Отчеты и аналитика', 'Получайте подробные отчеты об обучении и прогрессе.'],
                            ['Безопасная среда', 'Ваша работа проходит в изолированной и безопасной инфраструктуре.']
                        ].map(([title, text]) => (
                            <div key={title} className="card bg-base-100 shadow-lg p-4">
                                <h2 className="text-lg md:text-xl font-semibold">{title}</h2>
                                <p className="text-xs md:text-sm">{text}</p>
                            </div>
                        ))}
                    </div>

                    {/* Кнопка перехода к документации */}
                    <div className="text-center md:text-left">
                        <button className="btn btn-primary w-full md:w-auto">
                            <a href="/docs" target="_blank" rel="noopener noreferrer">
                                Перейти к документации
                            </a>
                        </button>
                    </div>
                </div>
            </div>

            {/* Правая часть: авторизация */}
            <div className="flex-1 bg-base-100 flex items-center justify-center p-4 md:p-8 order-1 md:order-2">
                <div className="w-full max-w-md p-4 md:p-6 border border-gray-500 shadow-xl rounded-lg text-center">
                    <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6">Вход в систему</h2>
                    <p className="text-xs md:text-sm mb-4 md:mb-6">
                        Используйте вашу учетную запись.
                    </p>
                    {loading ? (
                        <button className="btn btn-primary btn-block">
                            <span className="loading loading-spinner loading-sm"></span>
                            <span className="ml-2">Перенаправление...</span>
                        </button>
                    ) : (
                        <button className="btn btn-primary btn-block" onClick={loginHandler}>
                            Войти через OIDC
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;