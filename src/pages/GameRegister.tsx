import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Layout } from '../components/Layout';
import { TelegramCard } from '../components/TelegramCard';
// Добавляем импорт useTheme
import { useTheme } from '../hooks/ThemeContext';

interface Match {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  venue_id: number;
  max_players: number;
  price: number;
  status: string;
  description?: string;
  venue?: {
    id: number;
    name: string;
    address: string;
    image_url?: string;
  };
}

export default function GameRegister() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  // Используем хук useTheme для получения состояния темы
  const { isDarkTheme } = useTheme();

  // Функция для создания прокси URL для обхода CORS
  const getImageUrl = (url: string | undefined, matchId: number): string => {
    if (!url) return getFallbackImage();
    
    // Если изображение уже не загрузилось ранее, используем fallback
    if (failedImages.has(matchId)) {
      return getFallbackImage();
    }
    
    // Исправляем опечатки в протоколе
    let fixedUrl = url.replace(/^hhttps:/, 'https:');
    
    // Используем CORS прокси для обхода ограничений
    return `https://images.weserv.nl/?url=${encodeURIComponent(fixedUrl)}&w=120&h=90&fit=cover`;
  };

  // Функция для создания fallback изображения
  const getFallbackImage = (): string => {
    // Адаптируем fallback под тему: в темной теме темный фон, в светлой - светлый
    const bgColor = isDarkTheme ? '#333' : '#ddd';
    const textColor = isDarkTheme ? 'white' : 'black';
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="60" fill="${bgColor}"/>
        <text x="30" y="35" font-family="Arial" font-size="12" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">Арена</text>
      </svg>
    `)}`;
  };

  const handleImageError = (matchId: number) => {
    console.log('Image failed to load for match:', matchId);
    setFailedImages(prev => new Set(prev).add(matchId));
  };

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setError(null);
        const data = await api.getMatches();
        console.log('API response:', data);
        
        if (Array.isArray(data)) {
          setMatches(data);
        } else {
          console.error('Invalid data format:', data);
          setError('Неверный формат данных');
          setMatches([]);
        }
      } catch (error: any) {
        console.error('Error fetching matches:', error);
        setError('Ошибка при загрузке матчей. Проверьте подключение к интернету.');
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const formatTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <Layout title="Загрузка" showBackButton>
        <div style={{ 
          color: isDarkTheme ? '#fff' : '#333', 
          fontSize: '1.2rem', 
          textAlign: 'center',
          marginTop: '50px'
        }}>
          Загрузка площадок...
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Ближайшие матчи" showBackButton>
      <hr style={{
        width: '100%',
        border: 'none',
        height: '1px',
        backgroundColor: isDarkTheme ? '#575757' : '#ddd', // Адаптируем цвет разделителя
        margin: '0 0 20px 0'
      }}/>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        paddingBottom: '20px',
        alignItems: 'baseline'
      }}>
        {error ? (
          <div style={{
            color: isDarkTheme ? 'rgba(244, 67, 54, 0.9)' : '#d32f2f', // Адаптируем цвет ошибки
            textAlign: 'center',
            fontSize: '1rem',
            marginTop: '50px',
            padding: '16px',
            background: isDarkTheme ? 'rgba(244, 67, 54, 0.15)' : 'rgba(244, 67, 54, 0.1)',
            borderRadius: '12px',
            border: `1px solid ${isDarkTheme ? 'rgba(244, 67, 54, 0.3)' : 'rgba(244, 67, 54, 0.5)'}`,
            width: '100%'
          }}>
            ❌ {error}
          </div>
        ) : matches.length > 0 ? (
          matches.slice(0, 4).map((match) => {
            const imageUrl = getImageUrl(match.venue?.image_url, match.id);
            
            return (
              <TelegramCard 
                key={match.id} 
                to={`/match/${match.id}`}
                style={{
                  border: 'none',
                  borderRadius: '12px',
                  background: 'transparent',
                  marginLeft: '0',
                  padding: '0',
                  width: '100%'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  gap: '10px',
                  backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', // Легкий фон для карточки
                  border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, // Легкая граница
                }}>
                  {/* Изображение слева */}
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginRight: '12px',
                    flexShrink: 0,
                    backgroundColor: isDarkTheme ? '#333' : '#ddd', // Фон для плейсхолдера
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img 
                      src={imageUrl}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={() => handleImageError(match.id)}
                      alt={match.venue?.name || 'Арена'}
                    />
                  </div>
                  
                  {/* Контент справа */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      marginBottom: '6px',
                      lineHeight: '1.3',
                      color: isDarkTheme ? '#fff' : '#333' // Адаптируем цвет текста
                    }}>
                      {match.venue?.name || 'Арена'}
                    </div>
                    
                    <div style={{
                      fontSize: '0.85rem',
                      marginBottom: '6px',
                      opacity: 0.8,
                      color: isDarkTheme ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)' // Адаптируем цвет текста
                    }}>
                      {match.venue?.address || 'Адрес не указан'}
                    </div>
                    
                    <div style={{
                      fontSize: '0.85rem',
                      marginBottom: '4px',
                      opacity: 0.8,
                      fontWeight: '500',
                      color: isDarkTheme ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)' // Адаптируем цвет текста
                    }}>
                      {new Date(match.start_time).toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'long',
                        weekday: 'short'
                      })}
                    </div>
                    
                    <div style={{
                      fontSize: '0.95rem',
                      fontWeight: '500',
                      color: isDarkTheme ? '#fff' : '#333' // Адаптируем цвет текста
                    }}>
                      {formatTime(match.start_time)}-{formatTime(match.end_time)}
                    </div>
                  </div>
                </div>
              </TelegramCard>
            );
          })
        ) : (
          <div style={{
            color: isDarkTheme ? '#fff' : '#333', // Адаптируем цвет текста
            textAlign: 'center',
            fontSize: '1.1rem',
            marginTop: '50px',
            opacity: 0.8,
            width: '95%'
          }}>
            Нет доступных матчей
          </div>
        )}
      </div>
    </Layout>
  );
}
