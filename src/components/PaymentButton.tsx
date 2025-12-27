import React, { useState } from 'react';
import { TelegramButton } from './TelegramButton';
import { PaymentNotificationModal } from './PaymentNotificationModal';
import { api } from '../services/api';
import { telegramWebApp } from '../utils/telegram';
import { useTheme } from '../hooks/ThemeContext'; // Добавлено: импорт useTheme
import type { PaymentCreateResponse } from '../types';

interface PaymentButtonProps {
  registrationId: number;
  amount: number;
  onPaymentCreated?: () => void;
  disabled?: boolean;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  registrationId,
  amount,
  onPaymentCreated,
  disabled = false
}) => {
  const { isDarkTheme } = useTheme(); // Добавлено: получение isDarkTheme
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Добавлено: переменные для тематических цветов
  const textColor = isDarkTheme ? '#e0e0e0' : '#333333'; // Светло-серый для темной, черный для светлой
  const secondaryTextColor = isDarkTheme ? '#b0b0b0' : '#666666'; // Более тусклый для вторичного текста
  const errorBackground = isDarkTheme ? 'rgba(244,67,54,0.15)' : '#f8d7da'; // Темный фон для ошибки в темной теме
  const errorTextColor = isDarkTheme ? '#ffb3ba' : '#721c24'; // Светло-красный для темной, темный для светлой
  const errorBorder = isDarkTheme ? '1px solid rgba(244,67,54,0.3)' : '1px solid #f5c6cb'; // Прозрачный border для темной

  const handleButtonClick = () => {
    if (isCreating || disabled) return;
    setShowNotificationModal(true);
  };

  const handleCreatePayment = async () => {
    setShowNotificationModal(false);
    
    if (isCreating || disabled) return;

    setIsCreating(true);
    setError('');

    try {
      // Получаем текущий URL для возврата
      const returnUrl = window.location.origin + window.location.pathname;
      
      const response: PaymentCreateResponse = await api.createPayment(
        registrationId,
        amount,
        returnUrl
      );
      
      if (response.success && response.confirmation_url) {
        // Открываем страницу оплаты ЮКассы через Telegram WebApp.openInvoice
        // Это специальный метод для открытия платежных форм в Telegram
        telegramWebApp.openInvoice(response.confirmation_url, (status: string) => {
          console.log('Invoice status:', status);
          // Можно обработать статус оплаты здесь
        });
        
        if (onPaymentCreated) {
          onPaymentCreated();
        }
      } else {
        setError('Ошибка при создании платежа');
      }
    } catch (error: any) {
      console.error('Error creating payment:', error);
      setError(error.message || 'Ошибка при создании платежа');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <TelegramButton
          onClick={handleButtonClick}
          disabled={disabled || isCreating}
          style={{
            backgroundColor: disabled || isCreating ? '#666' : '#4CAF50',
            borderColor: disabled || isCreating ? '#666' : '#4CAF50',
            color: textColor, // Изменено: тематический цвет вместо 'grey'
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            borderRadius: '8px',
            border: '2px solid',
            cursor: disabled || isCreating ? 'not-allowed' : 'pointer',
            opacity: disabled || isCreating ? 0.6 : 1,
            transition: 'all 0.3s ease',
            width: '100%',
            maxWidth: '300px',
            fontWeight: '600'
          }}
        >
          <div
          
          style={{
            color:'grey',
          }}>

          {isCreating ? (
            '⏳ Создаем платеж...'
          ) : (
            `💳 Оплатить ${amount} ₽`
          )}
          </div>

        </TelegramButton>
        
        {error && (
          <div
            style={{
              marginTop: '0.75rem',
              padding: '0.5rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              backgroundColor: errorBackground, // Адаптировано: тематический фон для ошибки
              color: errorTextColor, // Адаптировано: тематический цвет текста ошибки
              border: errorBorder, // Адаптировано: тематический border
            }}
          >
            ❌ {error}
          </div>
        )}
        
        <div style={{ 
          fontSize: '0.8rem', 
          color: 'secondaryTextColor', // Адаптировано: вторичный тематический цвет вместо rgba(150, 147, 147, 0.7)
          marginTop: '0.5rem',
          fontStyle: 'italic'
        }}>
          Откроется окно ЮКассы для оплаты
        </div>
      </div>

      <PaymentNotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        onProceed={handleCreatePayment}
      />
    </>
  );
};