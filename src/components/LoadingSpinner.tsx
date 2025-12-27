import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Загрузка...', 
  size = 'medium' 
}) => {
  const sizeStyles = {
    small: { fontSize: '1rem', marginTop: '20px' },
    medium: { fontSize: '1.2rem', marginTop: '50px' },
    large: { fontSize: '1.5rem', marginTop: '80px' }
  };

  return (
    <div style={{ 
      color: 'white', 
      textAlign: 'center',
      ...sizeStyles[size]
    }}>
      <div style={{
        display: 'inline-block',
        width: '20px',
        height: '20px',
        border: '2px solid rgba(255,255,255,0.3)',
        borderRadius: '50%',
        borderTopColor: 'white',
        animation: 'spin 1s ease-in-out infinite',
        marginRight: '10px'
      }} />
      {message}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;