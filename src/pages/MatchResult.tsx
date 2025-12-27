import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { Layout } from "../components/Layout";
import { TelegramCard } from "../components/TelegramCard";
import { TelegramButton } from "../components/TelegramButton";
import { TelegramLoader } from "../components/TelegramLoader";
// Добавляем импорт useTheme
import { useTheme } from "../hooks/ThemeContext";

interface Match {
  id: number;
  start_time: string;
  end_time: string;
  venue?: {
    name: string;
    address: string;
  };
  results?: {
    winning_team: string;
    red_team_score: number;
    green_team_score: number;
    blue_team_score: number;
    best_player_id?: number;
    best_goal_player_id?: number;
    best_save_player_id?: number;
  };
}

export default function MatchResult() {
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  // Используем хук useTheme для получения состояния темы
  const { isDarkTheme } = useTheme();

  useEffect(() => {
    const fetchMatch = async () => {
      if (!matchId) return;

      try {
        const data = await api.getMatch(Number(matchId));
        setMatch(data);
      } catch (error) {
        console.error("Error fetching match:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  const getWinnerName = (winningTeam: string) => {
    switch (winningTeam) {
      case "red":
        return "Красные";
      case "green":
        return "Зеленые";
      case "blue":
        return "Синие";
      case "draw":
        return "Ничья";
      default:
        return "Неизвестно";
    }
  };

  const getWinnerIcon = (winningTeam: string) => {
    switch (winningTeam) {
      case "red":
        return "🔴";
      case "green":
        return "🟢";
      case "blue":
        return "🔵";
      case "draw":
        return "🤝";
      default:
        return "⚽";
    }
  };

  if (loading) {
    return (
      <Layout title="Результат матча" showBackButton>
        <TelegramLoader message="Загрузка результатов..." />
      </Layout>
    );
  }

  if (!match) {
    return (
      <Layout title="Матч не найден" showBackButton>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          paddingTop: '50px',
          gap: '20px'
        }}>
          <div style={{
            color: isDarkTheme ? 'rgba(255,255,255,0.7)' : "#575656ff",
            fontSize: "1.2rem",
            textAlign: "center",
          }}>
            Матч не найден
          </div>
          <TelegramButton onClick={() => navigate("/matches")}>
            Назад к истории матчей
          </TelegramButton>
        </div>
      </Layout>
    );
  }

  const formatMatchDate = () => {
    const date = new Date(match.start_time);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const formatMatchTime = () => {
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

  return (
    <Layout title="Результат матча" showBackButton>
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
            fontSize: '1.1rem', 
            fontWeight: '600', 
            marginBottom: '8px',
            color: isDarkTheme ? '#fff' : '#5a5a5aff'
          }}>
            {formatMatchDate()}
          </div>
          <div style={{ 
            fontSize: '0.95rem', 
            opacity: 0.8,
            marginBottom: '8px',
            color: isDarkTheme ? 'rgba(255,255,255,0.8)' : '#5a5a5aff'
          }}>
            {formatMatchTime()}
          </div>
          <div style={{ 
            fontSize: '0.9rem', 
            opacity: 0.7,
            color: isDarkTheme ? 'rgba(255,255,255,0.7)' : '#5a5a5aff'
          }}>
            {match.venue?.name || 'Площадка'}
          </div>
        </TelegramCard>

        {/* Результат матча */}
        <TelegramCard style={{ 
          textAlign: 'center',
          padding: '32px 24px',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ 
            fontSize: '4rem',
            marginBottom: '20px'
          }}>
            
          </div>
          
          <div style={{ 
            fontSize: '1.4rem',
            fontWeight: '700',
            marginBottom: '12px',
            color: isDarkTheme ? '#fff' : '#5a5a5aff'
          }}>
            {match.results
              ? "Матч завершен"
              : "Результат не определен"}
          </div>
          
          {match.results && (
            <div style={{ 
              fontSize: '1rem',
              opacity: 0.9,
              background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)',
              padding: '12px 20px',
              borderRadius: '16px',
              display: 'inline-block',
              textAlign: 'center',
              color: isDarkTheme ? '#fff' : '#5a5a5aff'
            }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px', display:'flex', flexDirection:'column', }}>
               Победители {getWinnerIcon(match.results.winning_team)} {getWinnerName(match.results.winning_team)}
              </div>
            </div>
          )}
        </TelegramCard>

        {/* Результаты игроков */}
        {match.results && (
          <>
            {(match.results.best_player || match.results.best_goal_player || match.results.best_save_player) && (
              <TelegramCard>
                <div style={{ 
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  marginBottom: '16px',
                  textAlign: 'center',
                  color: isDarkTheme ? '#fff' : '#707070ff'
                }}>
                   Лучшие игроки матча
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {match.results.best_player && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '8px',
                      background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      borderRadius: '8px'
                    }}>
                      <div style={{ fontSize: '1.5rem' }}>🌟</div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: isDarkTheme ? '#fff' : '#333333' }}>
                          Лучший игрок матча
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8, color: isDarkTheme ? 'rgba(255,255,255,0.8)' : '#666666' }}>
                          {match.results.best_player.full_name}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {match.results.best_goal_player && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '8px',
                      background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      borderRadius: '8px'
                    }}>
                      <div style={{ fontSize: '1.5rem' }}>⚡</div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: isDarkTheme ? '#fff' : '#333333' }}>
                          Лучший гол матча
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8, color: isDarkTheme ? 'rgba(255,255,255,0.8)' : '#666666' }}>
                          {match.results.best_goal_player.full_name}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {match.results.best_save_player && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '8px',
                      background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      borderRadius: '8px'
                    }}>
                      <div style={{ fontSize: '1.5rem' }}>🥅</div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: isDarkTheme ? '#fff' : '#333333' }}>
                          Лучший сейв матча
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8, color: isDarkTheme ? 'rgba(255,255,255,0.8)' : '#666666' }}>
                          {match.results.best_save_player.full_name}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TelegramCard>
            )}
            
            {/* Заметки к матчу */}
            {match.results.notes && (
              <TelegramCard>
                <div style={{ 
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  marginBottom: '12px',
                  textAlign: 'center',
                  color: isDarkTheme ? '#fff' : '#5a5959ff'
                }}>
                   Заметки к матчу
                </div>
                <div style={{ 
                  fontSize: '0.9rem',
                  lineHeight: '1.4',
                  opacity: 0.9,
                  whiteSpace: 'pre-wrap',
                  color: isDarkTheme ? 'rgba(255,255,255,0.9)' : '#6b6a6aff'
                }}>
                  {match.results.notes}
                </div>
              </TelegramCard>
            )}
          </>
        )}

        <div style={{ marginTop: '20px' }}>
          <TelegramButton onClick={() => navigate("/")} variant="secondary">
            Назад к истории матчей
          </TelegramButton>
        </div>
      </div>
    </Layout>
  );
}
