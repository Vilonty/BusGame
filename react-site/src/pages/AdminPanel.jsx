import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

function AdminPanel() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rarity: 'Common', // Изменено на значение, которое ожидает бэкенд
    image: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !user.is_staff) {
      navigate('/');
      return;
    }
    fetchBuses();
  }, [user, navigate, token]);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('http://localhost:8000/api/buses/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      setBuses(response.data);
    } catch (err) {
      console.error('Ошибка загрузки автобусов:', err);
      setError('Не удалось загрузить список автобусов');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('rarity', formData.rarity);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }
  
    try {
      setLoading(true);
      setError('');
      const response = await axios.post('http://localhost:8000/api/buses/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Token ${token}`
        }
      });
      
      if (response.status === 201) {
        setFormData({
          name: '',
          description: '',
          rarity: 'Common', // Сброс на значение по умолчанию
          image: null
        });
        await fetchBuses();
      }
    } catch (err) {
      console.error('Ошибка добавления автобуса:', err.response?.data || err.message);
      if (err.response) {
        // Обработка ошибок валидации
        if (err.response.data) {
          let errorMessages = [];
          
          if (typeof err.response.data === 'object') {
            for (const [key, value] of Object.entries(err.response.data)) {
              if (Array.isArray(value)) {
                errorMessages.push(...value);
              } else {
                errorMessages.push(value);
              }
            }
          } else {
            errorMessages.push(err.response.data);
          }
          
          setError(errorMessages.join(' '));
        } else {
          setError('Ошибка при добавлении автобуса');
        }
      } else {
        setError('Не удалось соединиться с сервером');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (busId) => {
    try {
      setLoading(true);
      setError('');
      await axios.delete(`http://localhost:8000/api/buses/${busId}/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      await fetchBuses();
    } catch (err) {
      console.error('Ошибка удаления автобуса:', err);
      setError('Не удалось удалить автобус');
    } finally {
      setLoading(false);
    }
  };

  // Функция для отображения человеко-читаемого названия редкости
  const getRarityDisplayName = (rarity) => {
    switch (rarity) {
      case 'Common': return 'Обычный';
      case 'Rare': return 'Редкий';
      case 'Epic': return 'Эпический';
      case 'Legendary': return 'Легендарный';
      default: return rarity;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, padding: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <h2>Панель модератора</h2>
        
        {loading && <p>Загрузка...</p>}
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h3>Добавить новый автобус</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Название:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Описание:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '8px', minHeight: '100px' }}
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Редкость:</label>
                <select
                  name="rarity"
                  value={formData.rarity}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="Common">Обычный</option>
                  <option value="Rare">Редкий</option>
                  <option value="Epic">Эпический</option>
                  <option value="Legendary">Легендарный</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Изображение:</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  opacity: loading ? 0.5 : 1
                }}
              >
                {loading ? 'Добавление...' : 'Добавить автобус'}
              </button>
            </form>
          </div>
          
          <div>
            <h3>Список автобусов</h3>
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {loading && buses.length === 0 ? (
                <p>Загрузка автобусов...</p>
              ) : buses.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {buses.map(bus => (
                    <li key={bus.id} style={{ 
                      marginBottom: '15px', 
                      padding: '15px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0' }}>{bus.name}</h4>
                        <p style={{ margin: '0 0 5px 0', color: '#666' }}>{bus.description}</p>
                        <span style={{ 
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 
                            bus.rarity === 'Common' ? '#a0a0a0' :
                            bus.rarity === 'Rare' ? '#007bff' :
                            bus.rarity === 'Epic' ? '#6f42c1' : '#fd7e14',
                          color: 'white',
                          fontSize: '0.8em'
                        }}>
                          {getRarityDisplayName(bus.rarity)}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleDelete(bus.id)}
                        disabled={loading}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          opacity: loading ? 0.5 : 1
                        }}
                      >
                        Удалить
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Нет доступных автобусов</p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default AdminPanel;