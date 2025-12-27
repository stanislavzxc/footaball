import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { TelegramCard } from '../components/TelegramCard';
import { TelegramButton } from '../components/TelegramButton';
import { api } from '../services/api';
import { showNotification } from '../utils/api';
import played from '../assets/played.png';
import played_black from '../assets/played_black.png';
import win from '../assets/win.png';
import win_black from '../assets/win_black.png';
import lose from '../assets/lose.png';
import lose_black from '../assets/lose_black.png';
import draw from '../assets/draw.png';
import draw_black from '../assets/draw_black.png';
import mvp from '../assets/mvp.png';
import mvp_black from '../assets/mvp_black.png';
import achive from '../assets/achive.png';
import achive_black from '../assets/achive_black.png';
import bestgoal from '../assets/bestgoal.png';
import bestgoal_black from '../assets/bestgoal_black.png';
import bestsave from '../assets/bestsave.png';
import bestsave_black from '../assets/bestsave_black.png';
import stat from '../assets/stat.png';
import stat_black from '../assets/stat_black.png';
import winrate from '../assets/winrate.png';
import winrate_black from '../assets/winrate_black.png';
import { useTheme } from '../hooks/ThemeContext'; 
import frame from '../assets/frame.png';

interface UserStats {
  id: number;
  user_id: number;
  total_matches: number;
  wins: number;
  draws: number;
  losses: number;
  mvp_count: number;
  best_goal_count: number;
  best_save_count: number;
  total_goals: number;
  total_saves: number;
  last_match_date?: string;
}

export default function PlayerStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { isDarkTheme, toggleTheme } = useTheme();
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    // Получение username из Telegram WebApp
    const webApp = (window as any).Telegram?.WebApp;
    if (webApp && webApp.initDataUnsafe?.user?.username) {
      setUsername(webApp.initDataUnsafe.user.username);
    } else {
      setUsername('Unknown');
    }
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading user stats:', error);
      showNotification('Ошибка загрузки статистики', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateWinRate = () => {
    if (!stats) return 0;
    const totalGames = stats.losses + stats.wins;
    if (totalGames === 0) return 0;
    // Формула: wins/(losses+wins)*100 с округлением вверх
    return Math.ceil((stats.wins / totalGames) * 100);
  };

  // Функция для выбора изображения в зависимости от темы
  const getImageSrc = (darkSrc: string, lightSrc: string) => isDarkTheme ? darkSrc : lightSrc;

  if (loading) {
    return (
      <Layout title="Мой профиль" showBackButton>
        <div style={{
          color: 'grey', // Изменено: серый текст
          fontSize: '1.2rem',
          textAlign: 'center',
          marginTop: '50px'
        }}>
          Загрузка статистики...
        </div>
      </Layout>
    );
  }

  if (!stats) {
    return (
      <Layout title="Моя статистика" showBackButton>
        <div style={{
          color: 'grey', // Изменено: серый текст
          fontSize: '1.1rem',
          textAlign: 'center',
          marginTop: '50px',
          opacity: 0.8
        }}>
          Статистика недоступна
        </div>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <TelegramButton to="/profile" variant="secondary">
            Назад в профиль
          </TelegramButton>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Мой профиль" showBackButton>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px', 
        width: '100%', 
        alignItems: 'center',
        paddingBottom: '20px'
      }}>
        {/* Контейнер для фигуры и toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          {/* Фигура с username и frame img */}
          <div style={{
            height: '40px',
            width: '100%',
            minWidth:'220px',
            maxWidth:'260px',
            borderRadius: '10px 50px 10px 50px', // Слева обычный border-radius, справа отзеркаленный интеграл (примерная кривая)
            backgroundColor: isDarkTheme ? '#333' : '#f5f5f5', // Изменено: чуть темнее белого для светлой темы
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px'
          }}>
            <span style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: 'grey' // Изменено: серый текст
            }}>
              @{username}
            </span>
            <img src={frame} alt="frame" style={{
              width: '40px',
              height: '40px',
              overflow: 'hidden',
              transform:'rotate(-5deg)',
            }} />
          </div>

          {/* Toggle справа от фигуры */}
          <label style={{
            position: 'relative',
            display: 'inline-block',
            width: '50px',
            height: '24px',
            backgroundColor: isDarkTheme ? '#000' : '#ccc', // Черный если темная тема (включен), серый если светлая
            borderRadius: '24px',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}>
            <input
              type="checkbox"
              checked={isDarkTheme}
              onChange={toggleTheme}  // Используем глобальную функцию toggleTheme из useTheme
              style={{
                opacity: 0,
                width: 0,
                height: 0
              }}
            />
            <span style={{
              position: 'absolute',
              top: '2px',
              left: isDarkTheme ? '26px' : '2px', // Положение слайдера в зависимости от состояния
              width: '20px',
              height: '20px',
              backgroundColor: isDarkTheme ? '#fff' : '#000', // Белый слайдер если off (светлая тема), черный если on (темная тема)
              borderRadius: '50%',
              transition: 'left 0.3s, background-color 0.3s'
            }}></span>
          </label>
        </div>

        {/* Основная статистика */}
        <TelegramCard style={{
          backgroundColor: isDarkTheme ? '#333' : '#f5f5f5' // Добавлено: чуть темнее белого для светлой темы
        }}>
          <div style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600', 
            marginBottom: '16px',
            textAlign: 'center',
            borderBottom: '1px solid rgba(128,128,128,0.3)', // Изменено: серый border для соответствия
            paddingBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: 'grey' // Добавлено: серый текст
          }}>
            <img src={getImageSrc(stat, stat_black)} alt="stat" style={{ width: '20px', height: '20px' }} /> Общая статистика
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '0.95rem',
              color: 'grey' // Добавлено: серый текст
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <img src={getImageSrc(played, played_black)} alt="played" style={{ width: '16px', height: '16px' }} /> Я сыграл:
              </span>
              <span style={{ fontWeight: '600' }}>{stats.total_matches} матчей</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '0.95rem',
              color: 'grey' // Добавлено: серый текст
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <img src={getImageSrc(win, win_black)} alt="win" style={{ width: '16px', height: '16px' }} /> Выиграно:
              </span>
              <span style={{ fontWeight: '600' }}>{stats.wins}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '0.95rem',
              color: 'grey' // Добавлено: серый текст
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <img src={getImageSrc(draw, draw_black)} alt="draw" style={{ width: '16px', height: '16px' }} /> Ничьих:
              </span>
              <span style={{ fontWeight: '600' }}>{stats.draws}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '0.95rem',
              color: 'grey' // Добавлено: серый текст
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <img src={getImageSrc(lose, lose_black)} alt="lose" style={{ width: '16px', height: '16px' }} /> Поражений:
              </span>
              <span style={{ fontWeight: '600' }}>{stats.losses}</span>
            </div>
          </div>
        </TelegramCard>

        {/* Достижения */}
        <TelegramCard style={{
          backgroundColor: isDarkTheme ? '#333' : '#f5f5f5' // Добавлено: чуть темнее белого для светлой темы
        }}>
          <div style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600', 
            marginBottom: '16px',
            textAlign: 'center',
            borderBottom: '1px solid rgba(128,128,128,0.3)', // Изменено: серый border
            paddingBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: 'grey' // Добавлено: серый текст
          }}>
            <img src={getImageSrc(achive, achive_black)} alt="achive" style={{ width: '20px', height: '20px' }} /> Достижения
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '0.95rem',
              color: 'grey' // Добавлено: серый текст
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <img src={getImageSrc(mvp, mvp_black)} alt="mvp" style={{ width: '16px', height: '16px' }} /> MVP:
              </span>
              <span style={{ fontWeight: '600' }}>{stats.mvp_count} раз</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '0.95rem',
              color: 'grey' // Добавлено: серый текст
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <img src={getImageSrc(bestgoal, bestgoal_black)} alt="bestgoal" style={{ width: '16px', height: '16px' }} /> Лучший гол:
              </span>
              <span style={{ fontWeight: '600' }}>{stats.best_goal_count} раз</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '0.95rem',
              color: 'grey' // Добавлено: серый текст
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <img src={getImageSrc(bestsave, bestsave_black)} alt="bestsave" style={{ width: '16px', height: '16px' }} /> Лучший сейв:
              </span>
              <span style={{ fontWeight: '600' }}>{stats.best_save_count} раз</span>
            </div>
          </div>
        </TelegramCard>

        {/* Процент побед */}
        <TelegramCard style={{
          textAlign: 'center',
          backgroundColor: isDarkTheme ? '#333' : '#f5f5f5' // Добавлено: чуть темнее белого для светлой темы
        }}>
          <div style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600', 
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: 'grey' // Добавлено: серый текст
          }}>
            <img src={getImageSrc(winrate, winrate_black)} alt="winrate" style={{ width: '20px', height: '20px' }} /> Процент побед
          </div>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: '700',
            color: 'grey' // Изменено: серый текст (убран цветовой акцент)
          }}>
            {calculateWinRate()}%
          </div>
          <div style={{ 
            fontSize: '0.85rem', 
            opacity: 0.8,
            marginTop: '4px',
            color: 'grey' // Добавлено: серый текст
          }}>
            {stats.wins} из {stats.total_matches} матчей
          </div>
        </TelegramCard>

        {stats.last_match_date && (
          <TelegramCard style={{
            textAlign: 'center',
            backgroundColor: isDarkTheme ? '#333' : '#f5f5f5' // Добавлено: чуть темнее белого для светлой темы
          }}>
            <div style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              marginBottom: '4px',
              color: 'grey' // Добавлено: серый текст
            }}>
              🗓️ Последний матч
            </div>
            <div style={{ 
              fontSize: '0.9rem', 
              opacity: 0.8,
              color: 'grey' // Добавлено: серый текст
            }}>
              {new Date(stats.last_match_date).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </TelegramCard>
        )}
        <TelegramButton to="/my-registrations">История записей</TelegramButton>

        <div style={{ marginTop: '20px' }}>
          <TelegramButton to="/" variant="secondary">
            Назад в профиль
          </TelegramButton>
        </div>
      </div>
    </Layout>
  );
}
