import React, { useState, useEffect } from 'react';
import { TelegramCard } from './TelegramCard';
import { TelegramButton } from './TelegramButton';

interface RefundInfo {
  id: number;
  amount: number;
  status: string;
  reason: string;
  created_at: string;
  processed_at?: string;
  admin_notes?: string;
  refund_id?: string;
  yookassa_status?: string;
  expected_timeframe?: string;
  status_description?: string;
  yookassa_error?: string;
}

interface RefundStatusCardProps {
  refundRequestId: number;
  onClose?: () => void;
}

export const RefundStatusCard: React.FC<RefundStatusCardProps> = ({ 
  refundRequestId, 
  onClose 
}) => {
  const [refundInfo, setRefundInfo] = useState<RefundInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRefundStatus();
  }, [refundRequestId]);

  const loadRefundStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/refunds/status/${refundRequestId}`);
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить информацию о возврате');
      }
      
      const data = await response.json();
      setRefundInfo(data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      'pending': '⏳',
      'approved': '✅',
      'processed': '💰',
      'rejected': '❌',
      'succeeded': '✅',
      'failed': '❌',
      'canceled': '🚫'
    };
    return icons[status] || '❓';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': '#FF9800',
      'approved': '#4CAF50',
      'processed': '#2196F3',
      'rejected': '#F44336',
      'succeeded': '#4CAF50',
      'failed': '#F44336',
      'canceled': '#9E9E9E'
    };
    return colors[status] || '#9E9E9E';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <TelegramCard>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '1.1rem', marginBottom: '10px' }}>
            Загрузка информации о возврате...
          </div>
        </div>
      </TelegramCard>
    );
  }

  if (error) {
    return (
      <TelegramCard>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '1.1rem', color: '#F44336', marginBottom: '15px' }}>
            ❌ {error}
          </div>
          <TelegramButton onClick={loadRefundStatus} variant="secondary">
            Попробовать снова
          </TelegramButton>
        </div>
      </TelegramCard>
    );
  }

  if (!refundInfo) {
    return (
      <TelegramCard>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '1.1rem', color: '#9E9E9E' }}>
            Информация о возврате не найдена
          </div>
        </div>
      </TelegramCard>
    );
  }

  return (
    <TelegramCard>
      <div style={{ padding: '5px' }}>
        {/* Заголовок */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
            💰 Возврат средств
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Основная информация */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '10px' 
          }}>
            <span style={{ 
              fontSize: '1.5rem', 
              marginRight: '10px' 
            }}>
              {getStatusIcon(refundInfo.yookassa_status || refundInfo.status)}
            </span>
            <div>
              <div style={{ 
                fontSize: '1.1rem', 
                fontWeight: '600',
                color: getStatusColor(refundInfo.yookassa_status || refundInfo.status)
              }}>
                {refundInfo.status_description || `Статус: ${refundInfo.status}`}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                Сумма: {refundInfo.amount} ₽
              </div>
            </div>
          </div>
        </div>

        {/* Ожидаемые сроки */}
        {refundInfo.expected_timeframe && (
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            borderRadius: '8px', 
            padding: '12px',
            marginBottom: '15px'
          }}>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '5px' }}>
              ⏰ Ожидаемые сроки:
            </div>
            <div style={{ fontSize: '0.9rem' }}>
              {refundInfo.expected_timeframe}
            </div>
          </div>
        )}

        {/* Детали */}
        <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '15px' }}>
          <div style={{ marginBottom: '5px' }}>
            <strong>Создан:</strong> {formatDate(refundInfo.created_at)}
          </div>
          {refundInfo.processed_at && (
            <div style={{ marginBottom: '5px' }}>
              <strong>Обработан:</strong> {formatDate(refundInfo.processed_at)}
            </div>
          )}
          {refundInfo.reason && (
            <div style={{ marginBottom: '5px' }}>
              <strong>Причина:</strong> {refundInfo.reason}
            </div>
          )}
          {refundInfo.refund_id && (
            <div style={{ marginBottom: '5px' }}>
              <strong>ID возврата:</strong> {refundInfo.refund_id.substring(0, 8)}...
            </div>
          )}
        </div>

        {/* Заметки администратора */}
        {refundInfo.admin_notes && (
          <div style={{ 
            background: 'rgba(255,255,255,0.05)', 
            borderRadius: '8px', 
            padding: '10px',
            marginBottom: '15px'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '5px' }}>
              📝 Заметки администратора:
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
              {refundInfo.admin_notes}
            </div>
          </div>
        )}

        {/* Ошибка YooKassa */}
        {refundInfo.yookassa_error && (
          <div style={{ 
            background: 'rgba(244, 67, 54, 0.1)', 
            borderRadius: '8px', 
            padding: '10px',
            marginBottom: '15px'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#F44336' }}>
              ⚠️ {refundInfo.yookassa_error}
            </div>
          </div>
        )}

        {/* Информация о сроках */}
        <div style={{ 
          background: 'rgba(255,255,255,0.05)', 
          borderRadius: '8px', 
          padding: '10px',
          fontSize: '0.8rem',
          opacity: 0.8,
          lineHeight: '1.4'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '5px' }}>
            💡 О сроках возврата:
          </div>
          <div>
            • Мгновенный возврат: если создан в день платежа<br/>
            • Стандартный срок: 3-5 рабочих дней<br/>
            • В редких случаях: до 30 дней (зависит от банка)
          </div>
        </div>

        {/* Кнопки */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginTop: '15px',
          justifyContent: 'center'
        }}>
          <TelegramButton onClick={loadRefundStatus} variant="secondary">
            Обновить статус
          </TelegramButton>
        </div>
      </div>
    </TelegramCard>
  );
};