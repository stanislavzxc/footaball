import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { TelegramButton } from "../../components/TelegramButton";
import { TelegramCard } from "../../components/TelegramCard";
import { adminApi } from "../../services/adminApi";
import { showNotification } from "../../utils/api";

interface LogEntry {
  id: number;
  timestamp: string;
  level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  log_type: 'bot_activation' | 'channel_join' | 'new_post' | 'registration' | 'cancellation' | 'comment' | 'notification' | 'payment' | 'admin_action' | 'system';
  message: string;
  details?: string;
  user?: {
    id: number;
    username?: string;
    full_name?: string;
    telegram_id: number;
  };
  match?: {
    id: number;
    date: string;
    start_time: string;
  };
}

export default function Logs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadLogs();
  }, [filter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 50 };
      
      if (filter !== 'all') {
        params.log_type = filter;
      }
      
      const data = await adminApi.getLogs(params);
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error loading logs:', error);
      showNotification('Ошибка загрузки логов', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getLogTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'bot_activation': '🤖 Активация бота',
      'channel_join': '📥 Вступление в канал',
      'new_post': '📝 Новый пост',
      'registration': '✅ Запись на матч',
      'cancellation': '❌ Отмена брони',
      'comment': '💬 Комментарий',
      'notification': '📢 Уведомление',
      'payment': '💳 Платеж',
      'payment_check': '🔍 Проверка платежа',
      'payment_timeout': '⏰ Таймаут платежа',
      'payment_refund': '💰 Возврат средств',
      'rate_limit': '🚫 Превышен лимит',
      'api_error': '⚠️ Ошибка API',
      'admin_action': '👨‍💼 Действие админа',
      'system': '⚙️ Система'
    };
    return labels[type] || type;
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'debug': '#9E9E9E',
      'info': 'white',
      'warning': '#FF9800',
      'error': '#F44336',
      'critical': '#D32F2F'
    };
    return colors[level] || 'white';
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredLogs = logs; // Фильтрация теперь происходит на сервере

  return (
    <Layout title="Логи системы" showBackButton>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px', 
        width: '100%', 
        alignItems: 'center',
        paddingBottom: '20px'
      }}>
        {/* Фильтры */}
        <TelegramCard>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
            Фильтр по типу:
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            justifyContent: 'center'
          }}>
            {[
              { key: 'all', label: 'Все' },
              { key: 'registration', label: 'Записи' },
              { key: 'cancellation', label: 'Отмены' },
              { key: 'bot_activation', label: 'Активации' },
              { key: 'notification', label: 'Уведомления' },
              { key: 'payment', label: 'Платежи' },
              { key: 'payment_check', label: 'Проверки платежей' },
              { key: 'rate_limit', label: 'Лимиты' },
              { key: 'api_error', label: 'Ошибки API' },
              { key: 'admin_action', label: 'Админ' },
              { key: 'system', label: 'Система' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  background: filter === key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${filter === key ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)'}`,
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </TelegramCard>

        {loading ? (
          <div style={{ 
            color: 'white', 
            fontSize: '1.1rem', 
            textAlign: 'center',
            marginTop: '20px'
          }}>
            Загрузка логов...
          </div>
        ) : (
          <>
            <div style={{ 
              fontSize: '1.1rem', 
              fontWeight: '600', 
              color: 'white',
              marginBottom: '8px'
            }}>
              Активность системы:
            </div>
            
            {filteredLogs.length === 0 ? (
              <div style={{ 
                color: 'white', 
                textAlign: 'center', 
                fontSize: '1.1rem',
                marginTop: '20px',
                opacity: 0.8
              }}>
                Нет записей для отображения
              </div>
            ) : (
              filteredLogs.map((log) => (
                <TelegramCard key={log.id} style={{ overflow: 'hidden' }}>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    width: '100%',
                    minWidth: 0 // Позволяет контейнеру сжиматься
                  }}>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.6)',
                      minWidth: '80px',
                      fontFamily: 'monospace'
                    }}>
                      {formatDateTime(log.timestamp)}
                    </div>
                    
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: getLevelColor(log.level),
                      marginTop: '6px',
                      flexShrink: 0
                    }} />
                    
                    <div style={{ 
                      flex: 1,
                      minWidth: 0, // Позволяет элементу сжиматься
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word'
                    }}>
                      <div style={{
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        marginBottom: '4px',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word'
                      }}>
                        {getLogTypeLabel(log.log_type)}
                      </div>
                      
                      <div style={{
                        fontSize: '0.85rem',
                        marginBottom: '4px',
                        lineHeight: '1.3',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word'
                      }}>
                        {log.user && (
                          <span style={{ fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>
                            {log.user.username ? `@${log.user.username}` : log.user.full_name || `ID:${log.user.telegram_id}`}:{' '}
                          </span>
                        )}
                        {log.message}
                      </div>
                      
                      {log.details && (
                        <div style={{
                          fontSize: '0.8rem',
                          opacity: 0.7,
                          fontStyle: 'italic',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          wordBreak: 'break-word'
                        }}>
                          {log.details}
                        </div>
                      )}
                      
                      {log.match && (
                        <div style={{
                          fontSize: '0.8rem',
                          opacity: 0.6,
                          marginTop: '2px',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          wordBreak: 'break-word'
                        }}>
                          Матч: {new Date(log.match.date).toLocaleDateString('ru-RU')} {new Date(log.match.start_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>
                </TelegramCard>
              ))
            )}
          </>
        )}

        {/* Информация */}
        <TelegramCard style={{ 
          fontSize: '0.85rem', 
          opacity: 0.8,
          background: 'rgba(255,255,255,0.05)'
        }}>
          <div style={{ textAlign: 'center', lineHeight: '1.4' }}>
            <strong>Отслеживается:</strong> активация бота, записи и отмены игроков, 
            все платежные операции (создание, проверка, ошибки), уведомления, 
            действия администраторов, системные события и ошибки API
          </div>
        </TelegramCard>

        <div style={{ marginTop: '10px' }}>
          <TelegramButton onClick={() => navigate('/admin')} variant="secondary">
            Назад в админку
          </TelegramButton>
        </div>
      </div>
    </Layout>
  );
}