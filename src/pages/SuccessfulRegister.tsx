import React from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { TelegramCard } from '../components/TelegramCard';
import { TelegramButton } from '../components/TelegramButton';

export default function SuccessfulRegister() {
  const { registrationId } = useParams<{ registrationId: string }>();

  return (
    <Layout title="Успешная регистрация" showBackButton>
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
          justifyContent: 'center'
        }}>
          <div style={{ 
            fontSize: '4rem',
            marginBottom: '20px'
          }}>
            🎉
          </div>
          
          <div style={{ 
            fontSize: '1.4rem',
            fontWeight: '600',
            marginBottom: '16px'
          }}>
            Поздравляем!
          </div>
          
          <div style={{ 
            fontSize: '1rem', 
            opacity: 0.9,
            lineHeight: '1.5',
            marginBottom: '16px'
          }}>
            Вы успешно записались на матч!<br />
            Ждем вас на поле.
          </div>

          {registrationId && (
            <div style={{ 
              fontSize: '0.85rem', 
              opacity: 0.7,
              background: 'rgba(255,255,255,0.1)',
              padding: '8px 12px',
              borderRadius: '10px',
              marginTop: '12px'
            }}>
              ID регистрации: #{registrationId}
            </div>
          )}
        </TelegramCard>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px', 
          alignItems: 'center' 
        }}>
          <TelegramButton to="/my-registrations">
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