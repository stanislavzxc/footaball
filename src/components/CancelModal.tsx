import React from 'react';
import { TelegramModal } from './TelegramModal';
import { TelegramButton } from './TelegramButton';

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  matchDate?: string;
  matchTime?: string;
}

export const CancelModal: React.FC<CancelModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  matchDate, 
  matchTime 
}) => {
  return (
    <TelegramModal
      isOpen={isOpen}
      onClose={onClose}
      title="Ты точно хочешь отменить бронь?"
      actions={
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
          alignItems: 'center'
        }}>
          <button 
            onClick={onConfirm}
            style={{
              background: '#F34F4F',
              borderRadius: '20px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              padding: '12px 24px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '200px',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              touchAction: 'manipulation'
            }}
          >
            Да, отменить
          </button>
          
          <TelegramButton onClick={onClose} style={{ minWidth: '200px' }}>
            Нет, оставить
          </TelegramButton>
        </div>
      }
    >
      {matchDate && matchTime && (
        <div style={{
          fontSize: '1rem',
          marginBottom: '8px',
          opacity: 0.9,
          background: 'rgba(255,255,255,0.1)',
          padding: '8px 12px',
          borderRadius: '10px'
        }}>
          📅 {matchDate} в {matchTime}
        </div>
      )}
      
      <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
        После отмены деньги будут возвращены в течение 3 рабочих дней
      </div>
    </TelegramModal>
  );
};