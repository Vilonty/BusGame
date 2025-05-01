import { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';
import styles from '../styles/Profile.module.css';

function Profile() {
  const { user, token, logout } = useContext(AuthContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [inventoryItems, setInventoryItems] = useState([]);
  const navigate = useNavigate();

  const fetchInventory = useCallback(async () => {
    try {
      const inventoryResponse = await axios.get('http://localhost:8000/api/inventory/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const formattedInventory = Array.isArray(inventoryResponse.data) 
        ? inventoryResponse.data.map(item => ({
            id: item.id || item.bus?.id,
            name: item.name || item.bus?.name,
            description: item.description || item.bus?.description,
            image_url: item.image_url || item.bus?.image_url,
            rarity: item.rarity || item.bus?.rarity,
            obtained_at: item.obtained_at
          }))
        : [];

      setInventoryItems(formattedInventory);
    } catch (err) {
      console.error('Ошибка загрузки инвентаря:', err);
      setError('Ошибка загрузки инвентаря');
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('Требуется авторизация');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        await fetchInventory();
      } catch (err) {
        console.error('Ошибка:', err);
        setError(err.message);
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, fetchInventory, logout, navigate]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !token) return;

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    try {
      setUploadProgress(0);
      const response = await axios.patch(
        'http://localhost:8000/api/auth/profile/avatar/',
        formData,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      // После обновления аватара просто перезагружаем страницу
      window.location.reload();
    } catch (err) {
      console.error('Ошибка загрузки аватара:', err);
      setError('Ошибка загрузки аватара');
    } finally {
      setUploadProgress(0);
    }
  };

  const handleScanTicket = () => {
    navigate('/scan-ticket');
  };

  const getRarityClass = (rarity) => {
    switch(rarity) {
      case 1: return styles.common;
      case 2: return styles.uncommon;
      case 3: return styles.rare;
      case 4: return styles.legendary;
      default: return styles.common;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Загрузка профиля...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          <span>Ошибка: {error}</span>
          <button 
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <Header />
      <div className={styles.profileContainer}>
        <div className={styles.leftSection}>
          <div className={styles.avatarContainer}>
            <img 
              src={user?.avatar || 'https://via.placeholder.com/200'} 
              alt="Аватар" 
              className={styles.avatarImage}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/200';
              }}
            />
            {uploadProgress > 0 && (
              <div className={styles.uploadProgress}>
                {uploadProgress}%
              </div>
            )}
          </div>
          
          <div className={styles.avatarUpload}>
            <input 
              type="file" 
              id="avatar-upload"
              onChange={handleFileChange}
              accept="image/*"
              className={styles.fileInput}
            />
            <label htmlFor="avatar-upload" className={styles.fileLabel}>
              Выбрать аватар
            </label>
            <button 
              onClick={handleUpload}
              disabled={!selectedFile}
              className={`${styles.uploadButton} ${selectedFile ? styles.active : styles.disabled}`}
            >
              Обновить
            </button>
            {selectedFile && (
              <p className={styles.fileName}>{selectedFile.name}</p>
            )}
          </div>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.profileHeader}>
            <h2 className={styles.username}>{user?.username || 'Пользователь'}</h2>
            <p className={styles.email}>{user?.email}</p>
          </div>

          <div className={styles.inventorySection}>
            <h3 className={styles.inventoryTitle}>Инвентарь</h3>
            {inventoryItems.length > 0 ? (
              <div className={styles.inventoryGrid}>
                {inventoryItems.map((item, index) => (
                  <div key={index} className={`${styles.inventoryCard} ${getRarityClass(item.rarity)}`}>
                    <div className={styles.cardImageContainer}>
                      <img 
                        src={item.image_url || 'https://via.placeholder.com/150'} 
                        alt={item.name} 
                        className={styles.cardImage}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/150';
                        }}
                      />
                      <div className={styles.rarityBadge}>
                        {item.rarity}★
                      </div>
                    </div>
                    <div className={styles.cardContent}>
                      <h4 className={styles.cardTitle}>{item.name}</h4>
                      <p className={styles.cardDescription}>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyInventory}>
                <img 
                  src="/empty-inventory.png" 
                  alt="Пустой инвентарь" 
                  className={styles.emptyImage}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/150';
                  }}
                />
                <p>Ваш инвентарь пуст</p>
                <button 
                  onClick={handleScanTicket}
                  className={styles.scanButtonEmpty}
                >
                  Сканировать билет
                </button>
              </div>
            )}
          </div>

          {inventoryItems.length > 0 && (
            <div className={styles.scanButtonContainer}>
              <button 
                onClick={handleScanTicket}
                className={styles.scanButton}
              >
                <span>Сканировать билет</span>
                <svg className={styles.scanIcon} viewBox="0 0 24 24">
                  <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/>
                  <path d="M3 9V6a2 2 0 0 1 2-2h2"/>
                  <path d="M7 5v4"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Profile;