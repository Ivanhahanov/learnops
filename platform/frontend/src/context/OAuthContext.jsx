import React, { createContext, useContext, useEffect, useState } from 'react';
import {logout, getUser } from '../services/AuthService';
const AuthContext = createContext();

// Провайдер контекста
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Метод для обновления токена
  const renewToken = async () => {
    try {
      const refreshedUser = await userManager.signinSilent();
      setUser(refreshedUser);
      console.log('Token renewed successfully');
    } catch (error) {
      console.error('Error renewing token:', error);
      handleLogout(); // При неудаче - выходим из системы
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getUser();

        if (currentUser && !currentUser.expired) {
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    // Интервал для обновления токена
    const setupTokenRenewal = () => {
      if (user) {
        const expiration = new Date(user.expires_at * 1000);
        const now = new Date();

        // Запускаем таймер для обновления токена за 1 минуту до его истечения
        const timeUntilRenewal = expiration - now - 60 * 1000;

        if (timeUntilRenewal > 0) {
          setTimeout(renewToken, timeUntilRenewal);
        }
      }
    };

    checkAuth();

    // Устанавливаем обновление токена при загрузке и изменении пользователя
    setupTokenRenewal();
  }, []);

  // Функции для входа и выхода
  const handleLogin = async () => {
    try {
      await sendOAuthRequest();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, logout: handleLogout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Кастомный хук для доступа к контексту
export const useAuth = () => {
  return useContext(AuthContext);
};