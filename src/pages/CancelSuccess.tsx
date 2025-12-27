import React from 'react';
import { Layout } from '../components/Layout';
import { TelegramCard } from '../components/TelegramCard';
import { TelegramButton } from '../components/TelegramButton';

export default function CancelSuccess() {
  return (
    <Layout title="Отмена регистрации" showBackButton>
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
          <div style={{ 
            fontSize: '3rem',
            marginBottom: '16px'
          }}>
            ✅
          </div>
          
          <div style={{ 
            fontSize: '1.3rem',
            fontWeight: '600',
            marginBottom: '16px'
          }}>
            Регистрация отменена
          </div>
          
          <div style={{ 
            fontSize: '1rem', 
            opacity: 0.9,
            lineHeight: '1.4'
          }}>
            Ваша регистрация на матч успешно отменена.
          </div>
        </TelegramCard>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px', 
          alignItems: 'center' 
        }}>
          <TelegramButton to="/register">
            Записаться на другую игру
          </TelegramButton>

          <TelegramButton to="/my-registrations" variant="secondary">
            Мои записи
          </TelegramButton>

          <TelegramButton to="/" variant="secondary">
            На главную
          </TelegramButton>
        </div>
      </div>
    </Layout>
  );
}