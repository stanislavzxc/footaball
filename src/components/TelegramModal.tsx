import React from 'react';
import { TelegramButton } from './TelegramButton';

interface TelegramModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function TelegramModal({ isOpen, onClose, title, children, actions }: TelegramModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
                  background: '#141414ff',

        border: '2px solid rgba(255,255,255,0.8)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '320px',
        padding: '24px',
        backdropFilter: 'blur(20px)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '1.2rem',
          fontWeight: '600',
          marginBottom: '16px',
          lineHeight: '1.3'
        }}>
          {title}
        </div>
        
        <div style={{
          fontSize: '1rem',
          lineHeight: '1.4',
          marginBottom: '20px',
          opacity: 0.9
        }}>
          {children}
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'center'
        }}>
          {actions || (
            <TelegramButton onClick={onClose} style={{ minWidth: '200px' }}>
              Закрыть
            </TelegramButton>
          )}
        </div>
      </div>
    </div>
  );
}