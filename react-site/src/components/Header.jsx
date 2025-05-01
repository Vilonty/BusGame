import { useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Header.module.css';

function Header() {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Функция для открытия консоли разработчика
  const openDevConsole = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Открытие консоли разработчика для модератора');
      // Здесь можно добавить дополнительную логику для разработки
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <h1 className={styles.title}>Автобусная игра</h1>
        <div className={styles.navButtons}>
          {isAuthenticated ? (
            <>
              {user?.is_staff && (
                <>
                  <button 
                    onClick={() => navigate('/panel')}
                    className={styles.adminButton}
                  >
                    Панель модератора (DEBUG)
                  </button>
                </>
              )}
              <button 
                onClick={() => navigate('/profile')}
                className={styles.profileButton}
              >
                Профиль
              </button>
              <button 
                onClick={handleLogout}
                className={styles.logoutButton}
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => navigate('/login')}
                className={styles.loginButton}
              >
                Войти
              </button>
              <button 
                onClick={() => navigate('/register')}
                className={styles.registerButton}
              >
                Регистрация
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;