import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { TelegramCard } from '../components/TelegramCard';
import { TelegramButton } from '../components/TelegramButton';

interface TimeframeInfo {
  name: string;
  duration: string;
  conditions: string;
}

interface RefundTimeframes {
  timeframes: Record<string, TimeframeInfo>;
  factors: string[];
  note: string;
}

export default function RefundInfo() {
  const navigate = useNavigate();
  const [timeframes, setTimeframes] = useState<RefundTimeframes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeframes();
  }, []);

  const loadTimeframes = async () => {
    try {
      const response = await fetch('/api/refunds/timeframes');
      if (response.ok) {
        const data = await response.json();
        setTimeframes(data);
      }
    } catch (error) {
      console.error('Error loading refund timeframes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeframeIcon = (key: string) => {
    const icons: Record<string, string> = {
      'instant': '⚡',
      'fast': '🚀',
      'standard': '⏰',
      'extended': '📅'
    };
    return icons[key] || '⏰';
  };

  const getTimeframeColor = (key: string) => {
    const colors: Record<string, string> = {
      'instant': '#4CAF50',
      'fast': '#2196F3',
      'standard': '#FF9800',
      'extended': '#9E9E9E'
    };
    return colors[key] || '#9E9E9E';
  };

  if (loading) {
    return (
      <Layout title="Информация о возвратах" showBackButton>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ color: 'white', fontSize: '1.1rem' }}>
            Загрузка информации...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Сроки возврата средств" showBackButton>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px', 
        width: '100%', 
        alignItems: 'center',
        paddingBottom: '20px'
      }}>
        
        {/* Заголовок */}
        <TelegramCard>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '10px' }}>
              💰 Возврат средств
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.4' }}>
              Информация о сроках обработки возвратов через ЮКассу
            </div>
          </div>
        </TelegramCard>

        {/* Типы возвратов */}
        {timeframes && (
          <>
            <div style={{ 
              fontSize: '1.1rem', 
              fontWeight: '600', 
              color: 'white',
              marginBottom: '8px'
            }}>
              Типы возвратов:
            </div>

            {Object.entries(timeframes.timeframes).map(([key, info]) => (
              <TelegramCard key={key}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ 
                    fontSize: '1.5rem',
                    marginTop: '2px'
                  }}>
                    {getTimeframeIcon(key)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '1rem', 
                      fontWeight: '600', 
                      marginBottom: '5px',
                      color: getTimeframeColor(key)
                    }}>
                      {info.name}
                    </div>
                    <div style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: '600', 
                      marginBottom: '8px' 
                    }}>
                      ⏱️ {info.duration}
                    </div>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      opacity: 0.8, 
                      lineHeight: '1.3' 
                    }}>
                      {info.conditions}
                    </div>
                  </div>
                </div>
              </TelegramCard>
            ))}

            {/* Факторы, влияющие на сроки */}
            <div style={{ 
              fontSize: '1.1rem', 
              fontWeight: '600', 
              color: 'white',
              marginTop: '10px',
              marginBottom: '8px'
            }}>
              Что влияет на сроки:
            </div>

            <TelegramCard>
              <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                {timeframes.factors.map((factor, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    marginBottom: '8px' 
                  }}>
                    <span style={{ 
                      color: 'white', 
                      marginRight: '8px',
                      fontSize: '0.8rem'
                    }}>
                      •
                    </span>
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </TelegramCard>

            {/* Важная информация */}
            <TelegramCard style={{ 
              background: 'rgba(33, 150, 243, 0.1)',
              border: '1px solid rgba(33, 150, 243, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ fontSize: '1.2rem' }}>💡</div>
                <div>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: '600', 
                    marginBottom: '5px',
                    color: 'white'
                  }}>
                    Важно знать:
                  </div>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    lineHeight: '1.4',
                    opacity: 0.9
                  }}>
                    {timeframes.note}
                  </div>
                </div>
              </div>
            </TelegramCard>

            {/* Часто задаваемые вопросы */}
            <div style={{ 
              fontSize: '1.1rem', 
              fontWeight: '600', 
              color: 'white',
              marginTop: '10px',
              marginBottom: '8px'
            }}>
              Часто задаваемые вопросы:
            </div>

            <TelegramCard>
              <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    ❓ Когда возврат будет мгновенным?
                  </div>
                  <div style={{ opacity: 0.8 }}>
                    Если вы отменили регистрацию в тот же день, когда оплачивали, 
                    и средства еще не поступили на счет организатора.
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    ❓ Почему возврат может занять до 30 дней?
                  </div>
                  <div style={{ opacity: 0.8 }}>
                    В редких случаях банк-эмитент вашей карты может дольше 
                    обрабатывать возврат. Это не зависит от нас или ЮКассы.
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    ❓ Как узнать статус возврата?
                  </div>
                  <div style={{ opacity: 0.8 }}>
                    Вы получите уведомление в боте, а также можете проверить 
                    статус в разделе "Мои регистрации".
                  </div>
                </div>
              </div>
            </TelegramCard>
          </>
        )}

        {/* Кнопка назад */}
        <div style={{ marginTop: '10px' }}>
          <TelegramButton onClick={() => navigate(-1)} variant="secondary">
            Назад
          </TelegramButton>
        </div>
      </div>
    </Layout>
  );
}