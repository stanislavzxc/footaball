import React, { useState } from 'react';
import { TelegramModal } from './TelegramModal';
import { TelegramButton } from './TelegramButton';

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlayer: (username: string) => Promise<void>;
  loading?: boolean;
}

export const AddPlayerModal: React.FC<AddPlayerModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddPlayer,
  loading = false
}) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!username.trim()) {
      setError('Введите username игрока');
      return;
    }

    // Убираем @ если пользователь его ввел
    const cleanUsername = username.replace('@', '').trim();
    
    if (cleanUsername.length < 3) {
      setError('Username должен содержать минимум 3 символа');
      return;
    }

    try {
      await onAddPlayer(cleanUsername);
      setUsername('');
      setError('');
      onClose();
    } catch (error: any) {
      setError(error.message || 'Ошибка при добавлении игрока');
    }
  };

  const handleClose = () => {
    setUsername('');
    setError('');
    onClose();
  };

  return (
    <TelegramModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Добавить игрока"
      actions={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <TelegramButton 
            onClick={handleSubmit}
            disabled={loading || !username.trim()}
            variant="register"
          >
            {loading ? 'Добавляем...' : 'Добавить игрока'}
          </TelegramButton>
          <TelegramButton onClick={handleClose} variant="secondary">
            Отмена
          </TelegramButton>
        </div>
      }
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px',
        width: '100%'
      }}>
        <div style={{ 
          fontSize: '0.9rem', 
          opacity: 0.9,
          textAlign: 'center',
          lineHeight: '1.4'
        }}>
          Введите username игрока из Telegram (без @)
        </div>
        
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            placeholder="nikitaborodinu"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: error ? '2px solid rgba(255,0,0,0.6)' : '2px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)'
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
          />
          <div style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '1rem',
            pointerEvents: 'none'
          }}>
            @
          </div>
        </div>

        {error && (
          <div style={{
            color: '#FF6B6B',
            fontSize: '0.85rem',
            textAlign: 'center',
            padding: '8px',
            background: 'rgba(255,107,107,0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255,107,107,0.3)'
          }}>
            {error}
          </div>
        )}

        <div style={{
          fontSize: '0.8rem',
          opacity: 0.7,
          textAlign: 'center',
          lineHeight: '1.3'
        }}>
          💡 Игрок должен быть зарегистрирован в боте
        </div>
      </div>
    </TelegramModal>
  );
};