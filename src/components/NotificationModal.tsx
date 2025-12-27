import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TelegramModal } from './TelegramModal';
import { TelegramButton } from './TelegramButton';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'cancel-registration' | 'cancel-booking' | 'no-places' | 'success-registration' | 'reserve-registration';
  onRetry?: () => void;
  onRefund?: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ 
  isOpen, 
  onClose, 
  type, 
  onRetry, 
  onRefund 
}) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    onClose();
    navigate('/');
  };

  const getModalContent = () => {
    switch (type) {
      case 'cancel-registration':
        return {
          title: 'Бронь отменена 😔',
          message: 'Будем ждать тебя на следующих играх!',
          icon: '😔',
          buttons: (
            <TelegramButton onClick={handleGoHome} style={{ minWidth: '200px' }}>
              На главную
            </TelegramButton>
          )
        };

      case 'cancel-booking':
        return {
          title: 'Бронь отменена 🙂',
          message: 'Будем ждать на следующей игре!',
          icon: '✅',
          buttons: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              {onRefund && (
                <TelegramButton onClick={onRefund} style={{ minWidth: '200px' }}>
                  Вернуть деньги
                </TelegramButton>
              )}
              <TelegramButton onClick={handleGoHome} variant="secondary" style={{ minWidth: '200px' }}>
                На главную
              </TelegramButton>
            </div>
          )
        };



      case 'no-places':
        return {
          title: 'Мест не осталось 😔',
          message: 'Добавили тебя в резерв, если место освободится - обязательно напишем!',
          icon: '😔',
          buttons: (
            <TelegramButton onClick={handleGoHome} style={{ minWidth: '200px' }}>
              На главную
            </TelegramButton>
          )
        };

      case 'reserve-registration':
        return {
          title: 'К сожалению мест не осталось 😔',
          message: 'добавили тебя в резерв, если место освободится — обязательно напишем!',
          icon: '😔',
          buttons: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <TelegramButton onClick={handleGoHome} style={{ minWidth: '200px', background: '#FF6B6B' }}>
                На главную
              </TelegramButton>
            </div>
          )
        };

      case 'success-registration':
        return {
          title: 'Отлично! Ты записался ✅',
          message: 'Увидимся на поле!\n\nЕсли что-то случится и ты не сможешь прийти, отмени бронь в профиле или напиши нам',
          icon: '🎉',
          buttons: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <TelegramButton onClick={() => { onClose(); navigate('/my-registrations'); }} style={{ minWidth: '200px' }}>
                Мои записи
              </TelegramButton>
              <TelegramButton onClick={handleGoHome} variant="secondary" style={{ minWidth: '200px' }}>
                На главную
              </TelegramButton>
            </div>
          )
        };

      default:
        return null;
    }
  };

  const content = getModalContent();
  if (!content) return null;

  return (
    <TelegramModal
      isOpen={isOpen}
      onClose={onClose}
      title={content.title}
      actions={content.buttons}
    >
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>
        {content.icon}
      </div>
      {content.message}
    </TelegramModal>
  );
};