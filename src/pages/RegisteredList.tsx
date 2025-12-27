import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Layout } from '../components/Layout';
import { TelegramCard } from '../components/TelegramCard';
import { TelegramButton } from '../components/TelegramButton';
import { TelegramLoader } from '../components/TelegramLoader';

interface Player {
  id: number;
  name: string;
  username?: string;
  registered_at: string;
  payment_status?: string;
}

interface Match {
  id: number;
  start_time: string;
  end_time: string;
  venue?: {
    name: string;
    address: string;
  };
}

export default function RegisteredList() {
  const { matchId } = useParams<{ matchId: string }>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!matchId) return;
      
      try {
        // Загружаем данные матча и игроков параллельно
        const [matchData, playersData] = await Promise.all([
          api.getMatch(Number(matchId)),
          api.getMatchPlayers(Number(matchId))
        ]);
        
        setMatch(matchData);
        setPlayers(playersData.players || []);
        
        // Отладочный вывод
        console.log('Match data:', matchData);
        console.log('Players data:', playersData);
        console.log('Players array:', playersData.players);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [matchId]);

  const formatMatchInfo = () => {
    if (!match) return { address: 'Площадка', date: '', time: '' };
    
    const date = new Date(match.start_time);
    const dateStr = date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long' 
    });
    
    const startTime = date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const endTime = new Date(match.end_time).toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const address = match.venue?.address || 'Адрес не указан';
    
    return {
      address,
      date: dateStr,
      time: `${startTime}-${endTime}`
    };
  };

  if (loading) {
    return (
      <Layout title="Записавшиеся игроки" showBackButton>
        <TelegramLoader message="Загрузка игроков..." />
      </Layout>
    );
  }

  return (
    <Layout title="Записавшиеся игроки" showBackButton>
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
          <div style={{ 
            fontSize: '0.95rem', 
            fontWeight: '500', 
            lineHeight: '1.4',
            opacity: 0.9,
            color: '#333333' // Изменено: темный текст
          }}>
            <div>{formatMatchInfo().address}</div>
            <div>{formatMatchInfo().date} {formatMatchInfo().time}</div>
          </div>
        </TelegramCard>

        {/* Список игроков */}
        <TelegramCard>
          <div style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600', 
            marginBottom: '16px', 
            textAlign: 'center',
            borderBottom: '1px solid rgba(0,0,0,0.2)', // Изменено: темная граница
            paddingBottom: '8px',
            color: '#333333' // Изменено: темный текст
          }}>
            👥 Записавшиеся игроки ({players.length})
          </div>
          
          {players.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {players.map((player, index) => (
                <div 
                  key={player.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    fontSize: '0.9rem',
                    borderBottom: index < players.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none', // Изменено: темная граница
                    color: '#727272ff' // Изменено: темный текст
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ 
                      marginRight: '12px', 
                      fontWeight: '600',
                      minWidth: '20px',
                      color: '#666666' // Изменено: более тусклый темный текст
                    }}>
                      {index + 1}.
                    </span>
                    <span>
                      {player.username ? `@${player.username}` : player.name}
                    </span>
                  </div>
                  <div>
                    {player.payment_status === 'paid' && '✅'}
                    {player.payment_status === 'pending' && '⏳'}
                    {!player.payment_status && '⚪'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '20px 0',
              fontSize: '0.95rem',
              opacity: 0.8,
              color: '#666666' // Изменено: более тусклый темный текст
            }}>
              Пока никто не записался
            </div>
          )}
        </TelegramCard>

        {/* Легенда статусов */}
        {players.some(p => p.payment_status) && (
          <TelegramCard style={{ fontSize: '0.8rem', opacity: 0.8, color: '#6e6e6eff' }}> {/* Изменено: темный текст */}
            <div style={{ textAlign: 'center' }}>
              <div>✅ - Оплачено</div>
              <div>⏳ - Ожидает оплаты</div>
              <div>⚪ - Статус неизвестен</div>
            </div>
          </TelegramCard>
        )}

        <div style={{ marginTop: '20px' }}>
          <TelegramButton to={`/match/${matchId}`} variant="secondary">
            Назад к записи
          </TelegramButton>
        </div>
      </div>
    </Layout>
  );
}
