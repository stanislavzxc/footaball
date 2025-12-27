import React from 'react';
import { TelegramModal } from './TelegramModal';
import { TelegramButton } from './TelegramButton';

interface PaymentNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
}

export const PaymentNotificationModal: React.FC<PaymentNotificationModalProps> = ({
  isOpen,
  onClose,
  onProceed
}) => {
  return (
    <TelegramModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      actions={
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
          alignItems: 'center'
        }}>
          <TelegramButton 
            onClick={onProceed}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#1E3A8A',
              borderColor: 'rgba(255, 255, 255, 1)',
              minWidth: '200px',
              borderRadius: '20px'
            }}
          >
            Вперёд к оплате
          </TelegramButton>
        </div>
      }
    >
      <div style={{
        background: 'rgba(74, 144, 226, 0.8)',
        borderRadius: '20px',
        padding: '20px',
        textAlign: 'center',
        color: 'white',
        fontSize: '1rem',
        lineHeight: '1.4',
        marginBottom: '16px'
      }}>
        Пожалуйста, после оплаты не забудь вернуться в бот и нажать «🔍 Проверить оплату»
      </div>
    </TelegramModal>
  );
};