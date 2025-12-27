import React from 'react';

interface Tab {
  id: string;
  label: string;
  count?: number;
  icon?: string;
}

interface TabSwitcherProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const TabSwitcher: React.FC<TabSwitcherProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className 
}) => {
  return (
    <div 
      className={className}
      style={{
        display: 'flex',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '25px',
        padding: '4px',
        marginBottom: '16px',
        width: '100%',
        maxWidth: '350px'
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '21px',
            border: 'none',
            background: activeTab === tab.id ? 'rgba(255,255,255,0.9)' : 'transparent',
            color: activeTab === tab.id ? '#1E3A8A' : 'white',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          {tab.icon && <span>{tab.icon}</span>}
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span style={{
              background: activeTab === tab.id ? 'rgba(30,58,138,0.2)' : 'rgba(255,255,255,0.2)',
              borderRadius: '10px',
              padding: '2px 6px',
              fontSize: '0.8rem',
              minWidth: '20px',
              textAlign: 'center'
            }}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default TabSwitcher;