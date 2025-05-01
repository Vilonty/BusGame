import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

function TestPage() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8000/api/hello/')
      .then(response => {
        setMessage(response.data.message);
      })
      .catch(error => {
        setMessage("Ошибка подключения к Django!");
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="page-layout">
      <Header />
      <main className="page-content">
        <h1>Страница тестирования</h1>
        {isLoading ? (
          <p>Загрузка данных...</p>
        ) : (
          <p>Ответ от Django: <strong>{message}</strong></p>
        )}
        <button 
          onClick={() => navigate('/')}
          className="back-button"
        >
          Вернуться на главную
        </button>
      </main>
      <Footer />
    </div>
  );
}

export default TestPage;