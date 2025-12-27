import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { TelegramCard } from '../components/TelegramCard';
import { TelegramButton } from '../components/TelegramButton';

export default function PaymentError() {
  const navigate = useNavigate();

  const handleRetry = () => {
    console.log('Retrying payment...');
    // Возвращаемся к предыдущей странице для повторной попытки
    navigate(-1);
  };

  return (
    <Layout title="Ошибка оплаты" showBackButton>
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
          minHeight: '250px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          borderColor: 'rgba(244, 67, 54, 0.5)'
        }}>
          <div style={{ 
            fontSize: '4rem',
            marginBottom: '20px'
          }}>
            ❌
          </div>
          
          <div style={{ 
            fontSize: '1.4rem',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#F44336'
          }}>
            Ошибка оплаты
          </div>
          
          <div style={{ 
            fontSize: '1rem', 
            opacity: 0.9,
            lineHeight: '1.5',
            marginBottom: '16px'
          }}>
            Не удалось обработать платеж.<br />
            Попробуйте еще раз или обратитесь в поддержку.
          </div>

          <div style={{ 
            fontSize: '0.9rem', 
            opacity: 0.7,
            background: 'rgba(244, 67, 54, 0.1)',
            padding: '12px',
            borderRadius: '10px',
            marginTop: '12px',
            lineHeight: '1.4'
          }}>
            💳 Проверьте данные карты и интернет-соединение
          </div>
        </TelegramCard>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px', 
          alignItems: 'center' 
        }}>
          <TelegramButton onClick={handleRetry}>
            Попробовать снова
          </TelegramButton>

          <TelegramButton to="/faq" variant="secondary">
            Связаться с поддержкой
          </TelegramButton>

          <TelegramButton to="/" variant="secondary">
            На главную
          </TelegramButton>
        </div>
      </div>
    </Layout>
  );
}