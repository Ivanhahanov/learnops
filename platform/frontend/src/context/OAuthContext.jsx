import React, { createContext, useContext, useEffect, useState } from 'react';
import {logout, getUser } from '../services/AuthService';

// Создаём контекст
const AuthContext = createContext();

// Провайдер контекста
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем текущего пользователя при загрузке приложения
    getUser().then((user) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  // Функции для входа и выхода
  const handleLogin = () => {
    login();
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