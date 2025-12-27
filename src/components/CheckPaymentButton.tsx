import React, { useState } from 'react';
import { TelegramButton } from './TelegramButton';
import { api } from '../services/api';

interface CheckPaymentButtonProps {
  registrationId: number;
  onPaymentChecked?: (success: boolean, message: string) => void;
  disabled?: boolean;
}

export const CheckPaymentButton: React.FC<CheckPaymentButtonProps> = ({
  registrationId,
  onPaymentChecked,
  disabled = false
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<number>(0);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  const COOLDOWN_SECONDS = 30;

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (cooldownRemaining > 0) {
      interval = setInterval(() => {
        setCooldownRemaining(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [cooldownRemaining]);

  const handleCheckPayment = async () => {
    if (isChecking || disabled || cooldownRemaining > 0) return;

    const now = Date.now();
    const timeSinceLastCheck = (now - lastCheckTime) / 1000;

    if (timeSinceLastCheck < COOLDOWN_SECONDS) {
      const remaining = Math.ceil(COOLDOWN_SECONDS - timeSinceLastCheck);
      setCooldownRemaining(remaining);
      return;
    }

    setIsChecking(true);
    setLastCheckTime(now);

    try {
      const response = await api.checkPaymentStatus(registrationId);
      
      if (response.success) {
        if (onPaymentChecked) {
          onPaymentChecked(true, response.message || 'Оплата подтверждена!');
        }
      } else {
        if (onPaymentChecked) {
          onPaymentChecked(false, response.message || 'Оплата не найдена');
        }
      }

      // Устанавливаем кулдаун после успешной проверки
      setCooldownRemaining(COOLDOWN_SECONDS);
      
    } catch (error: any) {
      console.error('Error checking payment:', error);
      
      if (error.message?.includes('30 секунд')) {
        setCooldownRemaining(COOLDOWN_SECONDS);
      }
      
      if (onPaymentChecked) {
        onPaymentChecked(false, error.message || 'Ошибка при проверке платежа');
      }
    } finally {
      setIsChecking(false);
    }
  };

  const isDisabled = disabled || isChecking || cooldownRemaining > 0;

  return (
    <TelegramButton
      onClick={handleCheckPayment}
      disabled={isDisabled}
      style={{
        backgroundColor: isDisabled ? '#666' : '#2196F3',
        borderColor: isDisabled ? '#534f4fff' : '#2196F3',
        color: 'white',
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        borderRadius: '8px',
        border: '2px solid',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        transition: 'all 0.3s ease',
        width: '100%',
        maxWidth: '300px',
        fontWeight: '600'
      }}
    >
      <div
      style={{color:'grey'}}
      >

      {isChecking ? (
        '⏳ Проверяем...'
      ) : cooldownRemaining > 0 ? (
        `⏱️ Подождите ${cooldownRemaining}с`
      ) : (
        '🔍 Проверить оплату'
      )}
      </div>

    </TelegramButton>
  );
};