import React, { useState } from 'react';
import { TelegramButton } from './TelegramButton';
import { api } from '../services/api';
import type { PaymentCheckResponse } from '../types';

interface PaymentCheckButtonProps {
  registrationId: number;
  onPaymentConfirmed?: () => void;
  disabled?: boolean;
}

export const PaymentCheckButton: React.FC<PaymentCheckButtonProps> = ({
  registrationId,
  onPaymentConfirmed,
  disabled = false
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  const canCheck = () => {
    if (!lastCheckTime) return true;
    const now = Date.now();
    const timeSinceLastCheck = (now - lastCheckTime) / 1000;
    return timeSinceLastCheck >= 30; // 30 секунд между проверками
  };

  const getTimeUntilNextCheck = () => {
    if (!lastCheckTime) return 0;
    const now = Date.now();
    const timeSinceLastCheck = (now - lastCheckTime) / 1000;
    return Math.max(0, 30 - timeSinceLastCheck);
  };

  const handleCheckPayment = async () => {
    if (!canCheck() || isChecking || disabled) return;

    setIsChecking(true);
    setMessage('');

    try {
      const response: PaymentCheckResponse = await api.checkPaymentStatus(registrationId);
      
      setLastCheckTime(Date.now());
      setMessage(response.message);
      
      if (response.success) {
        setMessageType('success');
        if (onPaymentConfirmed) {
          onPaymentConfirmed();
        }
      } else {
        setMessageType('error');
      }
    } catch (error: any) {
      console.error('Error checking payment:', error);
      setLastCheckTime(Date.now());
      
      if (error.message?.includes('Слишком частые проверки')) {
        setMessage('Подождите 30 секунд перед следующей проверкой');
        setMessageType('info');
      } else {
        setMessage('Ошибка при проверке платежа. Попробуйте позже.');
        setMessageType('error');
      }
    } finally {
      setIsChecking(false);
    }
  };

  const timeUntilNext = getTimeUntilNextCheck();
  const isDisabled = disabled || isChecking || !canCheck();

  return (
    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
      <TelegramButton
        onClick={handleCheckPayment}
        disabled={isDisabled}
        style={{
          backgroundColor: isDisabled ? '#ccc' : '#0088cc',
          color: 'white',
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          borderRadius: '8px',
          border: 'none',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.6 : 1,
          transition: 'all 0.3s ease'
        }}
      >
        {isChecking ? (
          '🔄 Проверяем...'
        ) : !canCheck() ? (
          `⏱️ Подождите ${Math.ceil(timeUntilNext)}с`
        ) : (
          '💳 Проверить платеж'
        )}
      </TelegramButton>
      
      {message && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.5rem',
            borderRadius: '6px',
            fontSize: '0.9rem',
            backgroundColor: 
              messageType === 'success' ? '#d4edda' :
              messageType === 'error' ? '#f8d7da' : '#d1ecf1',
            color:
              messageType === 'success' ? '#155724' :
              messageType === 'error' ? '#721c24' : '#0c5460',
            border: `1px solid ${
              messageType === 'success' ? '#c3e6cb' :
              messageType === 'error' ? '#f5c6cb' : '#bee5eb'
            }`
          }}
        >
          {messageType === 'success' && '✅ '}
          {messageType === 'error' && '❌ '}
          {messageType === 'info' && 'ℹ️ '}
          {message}
        </div>
      )}
      
      <div style={{ 
        fontSize: '0.8rem', 
        color: 'rgba(255, 255, 255, 0.7)', 
        marginTop: '0.5rem',
        fontStyle: 'italic'
      }}>
        Проверка доступна раз в 30 секунд
      </div>
    </div>
  );
};