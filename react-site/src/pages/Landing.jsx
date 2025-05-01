// src/pages/Landing.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from '../styles/Landing.module.css';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <div className={styles.busCard}>
          <h1 className={styles.title}>
            Автобусная игра
          </h1>
          <p className={styles.subtitle}>
            Нажмите чтобы начать
          </p>
          <button 
            onClick={() => navigate('/test')}
            className={styles.startButton}
          >
            Старт
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default HomePage;