import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = '📭', 
  title, 
  description,
  action 
}) => {
  return (
    <div style={{
      color: 'white',
      textAlign: 'center',
      fontSize: '1.1rem',
      marginTop: '50px',
      padding: '20px'
    }}>
      <div style={{
        fontSize: '3rem',
        marginBottom: '16px',
        opacity: 0.7
      }}>
        {icon}
      </div>
      
      <div style={{
        fontSize: '1.2rem',
        fontWeight: '600',
        marginBottom: '8px',
        opacity: 0.9
      }}>
        {title}
      </div>
      
      {description && (
        <div style={{
          fontSize: '1rem',
          opacity: 0.7,
          marginBottom: '20px',
          lineHeight: '1.4'
        }}>
          {description}
        </div>
      )}
      
      {action && (
        <div style={{ marginTop: '20px' }}>
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;