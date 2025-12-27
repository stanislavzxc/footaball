import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Layout } from '../components/Layout';
import { TelegramCard } from '../components/TelegramCard';
import { TelegramButton } from '../components/TelegramButton';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
// Добавляем импорт useTheme
import { useTheme } from '../hooks/ThemeContext';

interface Match {
  id: number;
  start_time: string;
  end_time: string;
  venue?: {
    name: string;
    address: string;
    image_url?: string; // Добавлено для поддержки изображений
  };
  results?: {
    winning_team: string;
    red_team_score: number;
    green_team_score: number;
    blue_team_score: number;
  };
}

export default function MatchHistory() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [nextGroupIndex, setNextGroupIndex] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set()); // Добавлено для отслеживания неудачных загрузок изображений

  // Используем хук useTheme для получения состояния темы
  const { isDarkTheme } = useTheme();

  // Функция для создания прокси URL для обхода CORS (аналогично GameRegister)
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

  // Функция для создания fallback изображения (аналогично GameRegister)
  const getFallbackImage = (): string => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjMwIiB5PSIzMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+0KDQsNCx0L48L3RleHQ+Cjwvc3ZnPg==';
  };

  const handleImageError = (matchId: number) => {
    console.log('Image failed to load for match:', matchId);
    setFailedImages(prev => new Set(prev).add(matchId));
  };

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // Получаем все завершенные матчи в системе
        const data = await api.getMatchHistory();
        console.log(data, '11123121123123')
        const allMatchesData = data || [];
        setAllMatches(allMatchesData);
        
        // По умолчанию показываем текущий месяц
        const now = new Date();
        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        setSelectedMonth(currentMonth);
        
        // Находим группу, в которой находится текущий месяц
        const months = new Map<string, Date>();
        allMatchesData.forEach((match: Match) => {
          const matchDate = new Date(match.start_time);
          const monthKey = `${matchDate.getFullYear()}-${matchDate.getMonth()}`;
          const monthStart = new Date(matchDate.getFullYear(), matchDate.getMonth(), 1);
          months.set(monthKey, monthStart);
        });
        const sortedMonths = Array.from(months.values()).sort((a, b) => a.getTime() - b.getTime());
        const groups: Date[][] = [];
        for (let i = 0; i < sortedMonths.length; i += 3) {
          groups.push(sortedMonths.slice(i, i + 3));
        }
        
        // Находим индекс группы с текущим месяцем
        const currentGroupIdx = groups.findIndex(group => 
          group.some(month => 
            month.getFullYear() === currentMonth.getFullYear() &&
            month.getMonth() === currentMonth.getMonth()
          )
        );
        
        if (currentGroupIdx >= 0) {
          setCurrentGroupIndex(currentGroupIdx);
        }
        
        // Фильтруем по текущему месяцу
        const filtered = allMatchesData.filter((match: Match) => {
          const matchDate = new Date(match.start_time);
          return matchDate.getFullYear() === currentMonth.getFullYear() &&
                 matchDate.getMonth() === currentMonth.getMonth();
        });
        setMatches(filtered);
      } catch (error) {
        console.error('Error fetching match history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  useEffect(() => {
    if (selectedMonth && allMatches.length > 0) {
      const filtered = allMatches.filter((match: Match) => {
        const matchDate = new Date(match.start_time);
        return matchDate.getFullYear() === selectedMonth.getFullYear() &&
               matchDate.getMonth() === selectedMonth.getMonth();
      });
      setMatches(filtered);
    }
  }, [selectedMonth, allMatches]);

  // Получаем уникальные месяцы из всех матчей, сортированные по возрастанию
  const getAvailableMonths = () => {
    const months = new Map<string, Date>();
    allMatches.forEach((match: Match) => {
      const matchDate = new Date(match.start_time);
      const monthKey = `${matchDate.getFullYear()}-${matchDate.getMonth()}`;
      const monthStart = new Date(matchDate.getFullYear(), matchDate.getMonth(), 1);
      months.set(monthKey, monthStart);
    });
    
    // Сортируем по возрастанию (старые месяцы первыми)
    return Array.from(months.values()).sort((a, b) => a.getTime() - b.getTime());
  };

  // Группируем месяцы по тройкам (сезоны)
  const getMonthGroups = () => {
    const months = getAvailableMonths();
    const groups: Date[][] = [];
    for (let i = 0; i < months.length; i += 3) {
      groups.push(months.slice(i, i + 3));
    }
    return groups;
  };

  const monthGroups = getMonthGroups();
  const currentMonths = monthGroups[currentGroupIndex] || [];

  const handlePreviousGroup = () => {
    if (currentGroupIndex > 0) {
      const newIndex = currentGroupIndex - 1;
      setNextGroupIndex(newIndex);
      setSlideDirection('right');
      // Ждем начала анимации, затем устанавливаем финальную позицию новой группы
      setTimeout(() => {
        const nextGroupEl = document.querySelector('.sliding-group') as HTMLElement;
        if (nextGroupEl) {
          nextGroupEl.style.transform = 'translateX(0)';
        }
      }, 10);
      // После завершения анимации переключаемся на новую группу
      setTimeout(() => {
        setCurrentGroupIndex(newIndex);
        setNextGroupIndex(null);
        setSlideDirection(null);
      }, 300);
    }
  };

  const handleNextGroup = () => {
    if (currentGroupIndex < monthGroups.length - 1) {
      const newIndex = currentGroupIndex + 1;
      setNextGroupIndex(newIndex);
      setSlideDirection('left');
      // Ждем начала анимации, затем устанавливаем финальную позицию новой группы
      setTimeout(() => {
        const nextGroupEl = document.querySelector('.sliding-group') as HTMLElement;
        if (nextGroupEl) {
          nextGroupEl.style.transform = 'translateX(0)';
        }
      }, 10);
      // После завершения анимации переключаемся на новую группу
      setTimeout(() => {
        setCurrentGroupIndex(newIndex);
        setNextGroupIndex(null);
        setSlideDirection(null);
      }, 300);
    }
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { month: 'long' });
  };

  const formatMatchDate = (match: Match) => {
    const date = new Date(match.start_time);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const formatMatchTime = (match: Match) => {
    const startTime = new Date(match.start_time).toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const endTime = new Date(match.end_time).toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return `${startTime}-${endTime}`;
  };

  const getWinnerName = (winningTeam: string) => {
    switch (winningTeam) {
      case 'red': return 'Красные';
      case 'green': return 'Зеленые';
      case 'blue': return 'Синие';
      case 'draw': return 'Ничья';
      default: return 'Неизвестно';
    }
  };

  const getWinnerIcon = (winningTeam: string) => {
    switch (winningTeam) {
      case 'red': return '🔴';
      case 'green': return '🟢';
      case 'blue': return '🔵';
      case 'draw': return '🤝';
      default: return '⚽';
    }
  };

  if (loading) {
    return (
      <Layout title="История игр" showBackButton>
        <LoadingSpinner message="Загрузка истории матчей..." />
      </Layout>
    );
  }

  return (
    <Layout title="История игр" showBackButton>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px', 
        width: '100%', 
        alignItems: 'center',
        paddingBottom: '20px'
      }}>
        {/* Фильтр по месяцам с стрелками */}
        {currentMonths.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '16px',
            width: '100%',
            maxWidth: '400px',
            position: 'relative'
          }}>
            {/* Стрелка влево */}
            <button
              onClick={handlePreviousGroup}
              disabled={currentGroupIndex === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: isDarkTheme ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(0,0,0,0.3)',
                background: currentGroupIndex === 0 
                  ? (isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)')
                  : (isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                color: currentGroupIndex === 0 
                  ? (isDarkTheme ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)')
                  : (isDarkTheme ? '#fff' : '#333333'),
                cursor: currentGroupIndex === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '1.2rem',
                padding: 0,
                flexShrink: 0
              }}
            >
              ←
            </button>

            {/* Контейнер для месяцев с анимацией */}
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              position: 'relative',
              overflow: 'hidden',
              minHeight: '44px',
              width: '100%'
            }}>
              {/* Текущая группа - уходящая */}
              <div
                key={`current-${currentGroupIndex}`}
                style={{
                  display: 'flex',
                  gap: '8px',
                  transition: slideDirection ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-in-out' : 'none',
                  transform: slideDirection === 'left' 
                    ? 'translateX(-100%)' 
                    : slideDirection === 'right' 
                    ? 'translateX(100%)' 
                    : 'translateX(0)',
                  opacity: slideDirection ? 0 : 1,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: slideDirection ? 'absolute' : 'relative',
                  left: slideDirection ? '0' : 'auto'
                }}
              >
                {currentMonths.map((month, index) => {
                  const isSelected = selectedMonth && 
                    month.getFullYear() === selectedMonth.getFullYear() &&
                    month.getMonth() === selectedMonth.getMonth();
                  
                  return (
                    <button
                      key={`current-${month.getFullYear()}-${month.getMonth()}-${index}`}
                      onClick={() => setSelectedMonth(month)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '12px',
                        border: isSelected 
                          ? '2px solid #4CAF50'
                          : (isDarkTheme ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(0,0,0,0.3)'),
                        background: isSelected 
                          ? '#6FBBE5'
                          : (isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(85, 83, 83, 0.1)'),
                        color: isSelected ? 'white' : (isDarkTheme ? '#fff' : '#333333'),
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease',
                        flexShrink: 0
                      }}
                    >
                      {getMonthName(month)}
                    </button>
                  );
                })}
              </div>
              
              {/* Новая группа - приходящая */}
              {nextGroupIndex !== null && (
                <div
                  key={`next-${nextGroupIndex}`}
                  className="sliding-group"
                  style={{
                    display: 'flex',
                    gap: '8px',
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    transform: slideDirection === 'left' 
                      ? 'translateX(100%)' 
                      : slideDirection === 'right' 
                      ? 'translateX(-100%)' 
                      : 'translateX(0)',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onTransitionEnd={() => {
                    // Анимация завершена
                  }}
                >
                  {(monthGroups[nextGroupIndex] || []).map((month, index) => {
                    const isSelected = selectedMonth && 
                      month.getFullYear() === selectedMonth.getFullYear() &&
                      month.getMonth() === selectedMonth.getMonth();
                    
                    return (
                      <button
                        key={`next-${month.getFullYear()}-${month.getMonth()}-${index}`}
                        onClick={() => setSelectedMonth(month)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '12px',
                          border: isSelected 
                            ? '2px solid #4CAF50'
                            : (isDarkTheme ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(139, 132, 132, 0.3)'),
                          background: isSelected 
                            ? 'rgba(76, 175, 80, 0.2)'
                            : (isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                          color: isSelected ? '#4CAF50' : (isDarkTheme ? '#fff' : '#333333'),
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s ease',
                          flexShrink: 0
                        }}
                      >
                        {getMonthName(month)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Стрелка вправо */}
            <button
              onClick={handleNextGroup}
              disabled={currentGroupIndex >= monthGroups.length - 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: isDarkTheme ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(0,0,0,0.3)',
                background: currentGroupIndex >= monthGroups.length - 1
                  ? (isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(133, 128, 128, 0.05)')
                  : (isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(90, 88, 88, 0.1)'),
                color: currentGroupIndex >= monthGroups.length - 1
                  ? (isDarkTheme ? 'rgba(255,255,255,0.3)' : 'rgba(121, 117, 117, 0.3)')
                  : (isDarkTheme ? '#fff' : '#686565ff'),
                cursor: currentGroupIndex >= monthGroups.length - 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '1.2rem',
                padding: 0,
                flexShrink: 0
              }}
            >
              →
            </button>
          </div>
        )}
        
        {selectedMonth && (
          <div style={{
            color: isDarkTheme ? 'rgba(255,255,255,0.7)' : 'rgba(65, 63, 63, 0.7)',
            fontSize: '0.9rem',
            textAlign: 'center',
            marginBottom: '10px',
            fontStyle: 'italic'
          }}>
            {matches.length > 0 
              ? ``
              : `Нет матчей за ${getMonthName(selectedMonth)}`
            }
          </div>
        )}
        {matches.length > 0 ? (
          matches.map((match) => {
            const imageUrl = getImageUrl(match.venue?.image_url, match.id); // Получаем URL изображения
            
            return (
              <TelegramCard key={match.id} to={`/match/${match.id}/result`}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  gap: '10px',
                }}>
                  {/* Изображение слева (иконка) */}
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginRight: '12px',
                    flexShrink: 0,
                    backgroundColor: isDarkTheme ? '#333' : '#f0f0f0',
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
                      marginBottom: '8px',
                      color: isDarkTheme ? '#fff' : '#333333'
                    }}>
                      {formatMatchDate(match)}
                    </div>
                    
                    <div style={{
                      fontSize: '1rem',
                      marginBottom: '8px',
                      fontWeight: '500',
                      color: isDarkTheme ? '#fff' : '#333333'
                    }}>
                      {formatMatchTime(match)}
                    </div>
                    
                    <div style={{
                      fontSize: '0.9rem',
                      marginBottom: '12px',
                      opacity: 0.8,
                      color: isDarkTheme ? 'rgba(255,255,255,0.8)' : '#666666'
                    }}>
                      {match.venue?.name || 'Площадка'}
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        fontSize: '1.5rem'
                      }}>
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        lineHeight: '1.3',
                        color: isDarkTheme ? '#fff' : '#333333'
                      }}>
                        {match.results ? (
                          <>
                            <strong>Матч завершен</strong>
                            {match.results.winning_team && (
                              <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                                {getWinnerIcon(match.results.winning_team)} {getWinnerName(match.results.winning_team)}
                              </div>
                            )}
                          </>
                        ) : (
                          <strong>Результат не определен</strong>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TelegramCard>
            );
          })
        ) : (
          <EmptyState
            title="История матчей пуста"
            description="Пока нет завершенных матчей в системе"
            action={
              <TelegramButton to="/" variant="secondary">
                Записаться на матч
              </TelegramButton>
            }
          />
        )}

        <div style={{ marginTop: '20px' }}>
          <TelegramButton to="/" variant="secondary">
            Назад на главную
          </TelegramButton>
        </div>
      </div>
    </Layout>
  );
}
