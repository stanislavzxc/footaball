import React, { useState, useEffect } from 'react';
import { TelegramModal } from './TelegramModal';
import { TelegramButton } from './TelegramButton';
import { telegramWebApp } from '../utils/telegram';

interface ImmediatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentUrl?: string;
  amount: number;
  onPaymentStarted?: () => void;
}

export const ImmediatePaymentModal: React.FC<ImmediatePaymentModalProps> = ({
  isOpen,
  onClose,
  paymentUrl,
  amount,
  onPaymentStarted
}) => {
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 минут в секундах

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose(); // Закрываем модал когда время истекло
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onClose]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePayment = () => {
    if (paymentUrl) {
      // Открываем страницу оплаты через Telegram WebApp
      // Это работает корректно на всех платформах
      telegramWebApp.openLink(paymentUrl);
      
      if (onPaymentStarted) {
        onPaymentStarted();
      }
    }
  };

  return (
    <TelegramModal
      isOpen={isOpen}
      onClose={onClose}
      title="Время для оплаты"
      actions={
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
          alignItems: 'center'
        }}>
          <TelegramButton 
            onClick={handlePayment}
            disabled={!paymentUrl}
            style={{
              background: 'rgba(76, 175, 80, 0.8)',
              borderColor: 'rgba(76, 175, 80, 1)',
              minWidth: '200px'
            }}
          >
            💳 Оплатить {amount} руб.
          </TelegramButton>
          
          <TelegramButton 
            onClick={onClose} 
            variant="secondary"
            style={{ minWidth: '200px' }}
          >
            Отмена
          </TelegramButton>
        </div>
      }
    >
      <>
        <div style={{
          fontSize: '1rem',
          marginBottom: '16px',
          textAlign: 'center',
          lineHeight: '1.4'
        }}>
          У вас есть <strong>30 минут</strong> для оплаты участия в матче.
        </div>
        
        <div style={{
          fontSize: '1.2rem',
          fontWeight: '600',
          textAlign: 'center',
          marginBottom: '16px',
          color: timeLeft < 300 ? '#FF5722' : '#4CAF50' // Красный если меньше 5 минут
        }}>
          ⏰ Осталось: {formatTime(timeLeft)}
        </div>
        
        <div style={{
          fontSize: '0.9rem',
          opacity: 0.8,
          textAlign: 'center',
          lineHeight: '1.4'
        }}>
          После оплаты вы автоматически получите уведомление о подтверждении записи.
          {timeLeft < 300 && (
            <div style={{ color: '#FF5722', marginTop: '8px', fontWeight: '600' }}>
              ⚠️ Внимание! Осталось меньше 5 минут!
            </div>
          )}
        </div>
      </>
    </TelegramModal>
  );
};