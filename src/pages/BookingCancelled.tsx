import React from 'react';
import { Layout } from '../components/Layout';
import { TelegramCard } from '../components/TelegramCard';
import { TelegramButton } from '../components/TelegramButton';

export default function BookingCancelled() {
  return (
    <Layout title="Бронь отменена" showBackButton>
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
            Бронь отменена
          </div>
          
          <div style={{ 
            fontSize: '1rem', 
            opacity: 0.9,
            lineHeight: '1.4'
          }}>
            Ваша бронь успешно отменена.<br />
            Деньги будут возвращены в течение 3-5 рабочих дней.
          </div>
        </TelegramCard>

        <TelegramButton to="/">
          На главную
        </TelegramButton>
      </div>
    </Layout>
  );
}
