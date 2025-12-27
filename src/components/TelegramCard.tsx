import React from 'react';
import { Link } from 'react-router-dom';

interface TelegramCardProps {
  children: React.ReactNode;
  to?: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function TelegramCard({ 
  children, 
  to, 
  onClick, 
  className = '',
  style = {}
}: TelegramCardProps) {
  const baseStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '20px',
    padding: '16px',
    margin: '8px 0',
    width: '100%',
    // maxWidth: '320px',
    backdropFilter: 'blur(10px)',
    color: 'white',
    fontFamily: 'Inter, sans-serif',
    transition: 'all 0.2s ease',
    cursor: (to || onClick) ? 'pointer' : 'default',
    textDecoration: 'none',
    display: 'block',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none',
    touchAction: 'auto',
    ...style,
    textAlign:'center',
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  if (to) {
    return (
      <Link 
        to={to} 
        style={baseStyle}
        className={className}
        onClick={handleClick}
      >
        {children}
      </Link>
    );
  }

  return (
    <div
      style={baseStyle}
      className={className}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}