import React from 'react';
import { Layout } from './Layout';
import { TelegramCard } from './TelegramCard';
import { TelegramButton } from './TelegramButton';

export const CancelNotification: React.FC = () => {
  return (
    <Layout title="Отмена записи" showBackButton>
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
          minHeight: '180px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ 
            fontSize: '2.5rem',
            marginBottom: '16px'
          }}>
            😊
          </div>
          
          <div style={{ 
            fontSize: '1.3rem',
            fontWeight: '600',
            marginBottom: '12px'
          }}>
            Бывает
          </div>
          
          <div style={{ 
            fontSize: '1.1rem', 
            opacity: 0.9
          }}>
            Увидимся на поле!
          </div>
        </TelegramCard>

        <TelegramButton to="/profile">
          Назад в профиль
        </TelegramButton>
      </div>
    </Layout>
  );
};