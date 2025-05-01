import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    token: null
  });

  // Инициализация при загрузке приложения
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Загружаем данные пользователя при старте приложения
      fetchUserData(token);
    }
  }, []);

  // Функция для загрузки данных пользователя
  const fetchUserData = async (token) => {
    try {
      const response = await axios.get('http://localhost:8000/api/auth/profile/', {
        headers: {
          'Authorization': `Token ${token}`, // Исправлено на Token вместо Bearer
        },
      });
      
      setAuthState({
        isAuthenticated: true,
        user: response.data,
        token: token
      });
    } catch (error) {
      console.error('Ошибка загрузки пользователя:', error);
      logout();
    }
  };

  const login = async (token) => {
    localStorage.setItem('authToken', token);
    await fetchUserData(token);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null
    });
  };

  const updateAuthUser = (updatedUser) => {
    setAuthState(prev => ({
      ...prev,
      user: updatedUser
    }));
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: authState.isAuthenticated,
      user: authState.user,
      token: authState.token,
      login,
      logout,
      updateAuthUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};