import React from 'react';
import { TelegramCard } from './TelegramCard';

interface StatsCardProps {
  title: string;
  stats: Array<{
    label: string;
    value: string | number;
    icon?: string;
  }>;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, stats, className }) => {
  return (
    <TelegramCard className={className}>
      <div style={{
        fontSize: '1.1rem',
        fontWeight: '600',
        marginBottom: '16px',
        textAlign: 'center',
        color: 'white'
      }}>
        {title}
      </div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {stats.map((stat, index) => (
          <div key={index} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px 0',
            borderBottom: index < stats.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9rem',
              color: 'rgba(255,255,255,0.9)'
            }}>
              {stat.icon && (
                <span style={{ fontSize: '1rem' }}>{stat.icon}</span>
              )}
              {stat.label}
            </div>
            <div style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: 'white'
            }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </TelegramCard>
  );
};

export default StatsCard;