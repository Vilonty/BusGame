import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  // Проверка совпадения паролей при изменении
  useEffect(() => {
    setPasswordsMatch(formData.password === formData.confirm_password);
  }, [formData.password, formData.confirm_password]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordsMatch) {
      setError('Пароли не совпадают');
      return;
    }
    
    try {
      await axios.post('http://localhost:8000/api/auth/register/', formData);
      navigate('/login');
    } catch (err) {
      // Handle error response properly
      if (err.response?.data) {
        // If it's an object, convert it to string
        if (typeof err.response.data === 'object') {
          const errorMessages = Object.values(err.response.data).flat().join(' ');
          setError(errorMessages);
        } else {
          setError(err.response.data);
        }
      } else {
        setError('Ошибка регистрации');
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, padding: '20px', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
        <h2>Регистрация</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Имя пользователя:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
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
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Подтвердите пароль:</label>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
              style={{ 
                width: '100%', 
                padding: '8px',
                border: passwordsMatch ? '1px solid #ccc' : '1px solid #ff4444'
              }}
            />
            {!passwordsMatch && formData.confirm_password && (
              <p style={{ color: '#ff4444', marginTop: '5px', fontSize: '0.8rem' }}>
                Пароли не совпадают
              </p>
            )}
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
            Зарегистрироваться
          </button>
          
          <p style={{ marginTop: '15px' }}>
            Уже есть аккаунт? <span 
              onClick={() => navigate('/login')}
              style={{ color: '#0066cc', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Войти
            </span>
          </p>
        </form>
      </main>
      <Footer />
    </div>
  );
}

export default RegisterPage;