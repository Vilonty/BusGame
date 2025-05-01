import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useContext } from 'react';
import { AuthContext } from '../AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  

  // LoginPage.jsx
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login/', formData);
      
      // Проверяем наличие токена в ответе
      if (!response.data.token) {
        throw new Error('Токен не получен от сервера');
      }
      
      // Логиним пользователя с токеном и данными
      await login(response.data.token, {
        id: response.data.user_id,
        username: response.data.username,
        email: response.data.email
      });
      
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка авторизации');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, padding: '20px', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
        <h2>Авторизация</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Имя:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Пароль:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          
          <button 
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Войти
          </button>
          
          <p style={{ marginTop: '15px' }}>
            Нет аккаунта? <span 
              onClick={() => navigate('/register')}
              style={{ color: '#0066cc', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Зарегистрироваться
            </span>
          </p>
        </form>
      </main>
      <Footer />
    </div>
  );
}

export default LoginPage;