import React, { createContext, useContext, useEffect, useState } from 'react';
import {logout, getUser } from '../services/AuthService';

// Создаём контекст
const AuthContext = createContext();

// Провайдер контекста
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    checkAuth();
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