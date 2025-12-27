import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { TelegramButton } from "../../components/TelegramButton";
import { TelegramCard } from "../../components/TelegramCard";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";
import { AddPlayerModal } from "../../components/AddPlayerModal";
import { adminApi } from "../../services/adminApi";
import { showNotification, formatDateTime } from "../../utils/api";

interface User {
  id: number;
  username?: string;
  full_name?: string;
}

interface Registration {
  id: number;
  user?: User;
}

interface Match {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  venue: {
    name: string;
  };
  current_players?: number;
  max_players?: number;
  reserve_count?: number;
}

export default function CurrentBookings() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [registrations, setRegistrations] = useState<{
    main_list: Registration[];
    reserve: Registration[];
  }>({ main_list: [], reserve: [] });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [addingPlayer, setAddingPlayer] = useState(false);

  useEffect(() => {
    loadUpcomingMatches();
  }, []);

  const loadUpcomingMatches = async () => {
    try {
      console.log('Loading upcoming matches...');
      const data = await adminApi.getMatches('open');
      console.log('Matches data received:', data);
      
      // Проверяем разные форматы ответа
      let matchesArray = [];
      if (Array.isArray(data)) {
        matchesArray = data;
      } else if (data && Array.isArray(data.matches)) {
        matchesArray = data.matches;
      } else if (data && 'data' in data && Array.isArray((data as any).data)) {
        matchesArray = (data as any).data;
      } else {
        console.warn('Unexpected matches data format:', data);
        matchesArray = [];
      }
      
      // Фильтруем только предстоящие матчи (которые еще не прошли)
      const now = new Date();
      const upcomingMatches = matchesArray.filter(match => {
        const matchStartTime = new Date(match.start_time);
        return matchStartTime > now;
      });
      
      // Сортируем матчи по возрастанию времени (от ближайшего к последнему)
      const sortedMatches = upcomingMatches.sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
      
      console.log('Setting sorted upcoming matches:', sortedMatches);
      setMatches(sortedMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
      showNotification('Ошибка загрузки матчей', 'error');
    }
  };

  const loadMatchRegistrations = async (matchId: number) => {
    try {
      setLoading(true);
      const data = await adminApi.getMatchRegistrations(matchId);
      setRegistrations(data);
    } catch (error) {
      console.error('Error loading registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchSelect = async (match: Match) => {
    setSelectedMatch(match);
    await loadMatchRegistrations(match.id);
  };

  const handleRemovePlayer = async (registrationId: number, event?: React.MouseEvent) => {
    // Предотвращаем всплытие события
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!window.confirm('Удалить игрока из списка?')) return;

    try {
      setLoading(true);
      await adminApi.removePlayerRegistration(registrationId);
      setSuccess(true);
      
      // Перезагружаем список регистраций
      if (selectedMatch) {
        await loadMatchRegistrations(selectedMatch.id);
      }
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error removing player:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Ошибка при удалении игрока';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMatch = async (matchId: number) => {
    if (!window.confirm('Удалить матч? Это действие нельзя отменить. Все записи будут удалены.')) {
      return;
    }

    try {
      setLoading(true);
      await adminApi.deleteMatch(matchId, true); // force delete
      showNotification('Матч удален', 'success');
      
      // Перезагружаем список матчей
      await loadUpcomingMatches();
      setSelectedMatch(null);
    } catch (error) {
      console.error('Error deleting match:', error);
      showNotification('Ошибка при удалении матча', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async (username: string) => {
    if (!selectedMatch) return;

    try {
      setAddingPlayer(true);
      await adminApi.addPlayerToMatch(selectedMatch.id, username);
      showNotification('Игрок добавлен', 'success');
      
      // Перезагружаем список регистраций
      await loadMatchRegistrations(selectedMatch.id);
    } catch (error: any) {
      console.error('Error adding player:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Ошибка при добавлении игрока';
      throw new Error(errorMessage);
    } finally {
      setAddingPlayer(false);
    }
  };



  if (success) {
    return (
      <Layout title="Данные обновлены" showBackButton>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          paddingTop: '40px',
          paddingBottom: '20px',
          gap: '20px'
        }}>
          <TelegramCard style={{ 
            textAlign: 'center',
            padding: '32px 24px',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '12px' }}>
              Данные успешно обновлены
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9, lineHeight: '1.4' }}>
              Игрокам из резерва высылается уведомление об освободившемся месте
            </div>
          </TelegramCard>
          
          <TelegramButton onClick={() => setSuccess(false)}>
            Назад к списку
          </TelegramButton>
        </div>
      </Layout>
    );
  }

  if (!selectedMatch) {
    return (
      <Layout title="Текущие брони" showBackButton>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px', 
          width: '100%', 
          alignItems: 'center',
          paddingBottom: '20px'
        }}>
          <div style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600', 
            color: 'white',
            marginBottom: '8px'
          }}>
            Предстоящие матчи:
          </div>
          
          {matches.length === 0 ? (
            <EmptyState
              icon="📅"
              title="Нет предстоящих матчей"
              description="Все матчи завершены или нет активных броней"
              action={
                <TelegramButton onClick={() => navigate('/admin')} variant="secondary">
                  Назад в админку
                </TelegramButton>
              }
            />
          ) : (
            matches.map(match => (
              <TelegramCard key={match.id} onClick={() => handleMatchSelect(match)}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      marginBottom: '4px'
                    }}>
                      {formatDateTime(match.date, match.start_time)} - {new Date(match.end_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      opacity: 0.8,
                      marginBottom: '4px'
                    }}>
                      {match.venue.name}
                    </div>
                    {(match.current_players !== undefined || match.reserve_count !== undefined) && (
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#90EE90',
                        fontWeight: '600'
                      }}>
                        👥 {match.current_players || 0}/{match.max_players || 0}
                        {match.reserve_count ? ` (+${match.reserve_count} в резерве)` : ''}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '1.2rem', opacity: 0.7 }}>→</div>
                </div>
              </TelegramCard>
            ))
          )}

          <div style={{ marginTop: '20px' }}>
            <TelegramButton onClick={() => navigate('/admin')} variant="secondary">
              Назад в админку
            </TelegramButton>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Детали матча" showBackButton>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px', 
        width: '100%', 
        alignItems: 'center',
        paddingBottom: '20px'
      }}>
        {/* Информация о матче */}
        <TelegramCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>
            {formatDateTime(selectedMatch.date, selectedMatch.start_time)} - {new Date(selectedMatch.end_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            {selectedMatch.venue.name}
          </div>
        </TelegramCard>

        {loading ? (
          <LoadingSpinner message="Загрузка данных..." size="small" />
        ) : (
          <>
            {/* Основной список */}
            <TelegramCard>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
                👥 Основной список игроков ({registrations.main_list.length})
              </div>
              
              {registrations.main_list.length === 0 ? (
                <div style={{ textAlign: 'center', opacity: 0.8, padding: '10px 0' }}>
                  Пока никто не записался
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {registrations.main_list.map((reg, index) => (
                    <div key={reg.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: index < registrations.main_list.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '600', minWidth: '20px' }}>{index + 1}.</span>
                        <span>@{reg.user?.username || reg.user?.full_name || 'Unknown'}</span>
                      </div>
                      <button
                        onClick={(e) => handleRemovePlayer(reg.id, e)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        disabled={loading}
                        style={{
                          background: 'rgba(255,0,0,0.2)',
                          border: '1px solid rgba(255,0,0,0.5)',
                          borderRadius: '12px',
                          color: 'white',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          padding: '4px 8px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                          opacity: loading ? 0.5 : 1,
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          touchAction: 'manipulation'
                        }}
                      >
                        Убрать
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </TelegramCard>

            {/* Резерв */}
            <TelegramCard>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
                🔄 Резерв ({registrations.reserve.length})
              </div>
              
              {registrations.reserve.length === 0 ? (
                <div style={{ textAlign: 'center', opacity: 0.8, padding: '10px 0' }}>
                  Резерв пуст
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {registrations.reserve.map((reg, index) => (
                    <div key={reg.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: index < registrations.reserve.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '600', minWidth: '20px' }}>{index + 1}.</span>
                        <span>@{reg.user?.username || reg.user?.full_name || 'Unknown'}</span>
                      </div>
                      <button
                        onClick={(e) => handleRemovePlayer(reg.id, e)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        disabled={loading}
                        style={{
                          background: 'rgba(255,0,0,0.2)',
                          border: '1px solid rgba(255,0,0,0.5)',
                          borderRadius: '12px',
                          color: 'white',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          padding: '4px 8px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                          opacity: loading ? 0.5 : 1,
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          touchAction: 'manipulation'
                        }}
                      >
                        Убрать
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </TelegramCard>
          </>
        )}

        {/* Кнопки действий */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px', 
          alignItems: 'center',
          marginTop: '20px'
        }}>
          <TelegramButton 
            onClick={() => setShowAddPlayerModal(true)}
            variant="register"
            disabled={loading}
          >
            ➕ Добавить игрока
          </TelegramButton>

          <button
            onClick={() => handleDeleteMatch(selectedMatch.id)}
            disabled={loading}
            style={{
              width: '100%',
              maxWidth: '320px',
              height: '48px',
              background: 'rgba(255,0,0,0.2)',
              border: '2px solid rgba(255,0,0,0.6)',
              borderRadius: '24px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)',
              opacity: loading ? 0.7 : 1
            }}
          >
            🗑️ Удалить матч
          </button>
          
          <TelegramButton onClick={() => setSelectedMatch(null)} variant="secondary">
            Назад к списку матчей
          </TelegramButton>
          
          <TelegramButton onClick={() => navigate('/admin')} variant="secondary">
            Назад в админку
          </TelegramButton>
        </div>
      </div>

      <AddPlayerModal
        isOpen={showAddPlayerModal}
        onClose={() => setShowAddPlayerModal(false)}
        onAddPlayer={handleAddPlayer}
        loading={addingPlayer}
      />
    </Layout>
  );
}