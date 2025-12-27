import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';
import { getLogoUrl } from '../utils/logoUtils';
import { useTheme } from '../hooks/ThemeContext'; // Импорт хука для темы

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  className?: string;
  isMainPage?: boolean;
  // Удален prop isDarkTheme, теперь используем из контекста
}

export function Layout({ children, title, showBackButton = false, onBackClick, className = '', isMainPage = false }: LayoutProps) {
  const { webApp, viewportHeight, viewportStableHeight, isInTelegram } = useTelegram();
  const navigate = useNavigate();
  const { isDarkTheme } = useTheme(); // Получаем тему из контекста
  
  const handleBackClick = useCallback(() => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  }, [onBackClick, navigate]);

  useEffect(() => {
    if (isInTelegram) {
      if (showBackButton) {
        webApp.showBackButton(handleBackClick);
      } else {
        webApp.hideBackButton();
      }
    }

    return () => {
      if (isInTelegram) {
        webApp.hideBackButton();
      }
    };
  }, [showBackButton, handleBackClick, webApp, isInTelegram]);

  // Используем стабильную высоту viewport для лучшей производительности
  const containerHeight = isInTelegram ? viewportStableHeight : viewportHeight;

  return (
    <div 
      className={`telegram-mini-app-container ${className}`}
      style={{
        width: '100vw',
        height: `${containerHeight}px`,
        maxHeight: `${containerHeight}px`,
        position: 'fixed',
        top: 0,
        left: 0,
        background: isDarkTheme ? '#000' : '#fff', // Фон в зависимости от темы
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        overflow: 'hidden',
        touchAction: 'pan-y',
        overscrollBehavior: 'none'
      }}
    >
      {/* Фоновое изображение - оптимизировано */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.3,
          zIndex: 0
        }}
      />

      {/* Затемняющий слой - всегда отображается, цвет зависит от темы */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: isDarkTheme ? '#141414ff' : '#fff', // Черный для темной, белый для светлой
          zIndex: 1
        }}
      />

      {/* Лого - яркое на главной, затемненное на остальных */}
      <div 
        style={{
          position: 'absolute',
          top: '2%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: isMainPage ? 2 : 1,
          opacity: isMainPage ? 1 : 0.15,
          pointerEvents: 'none'
        }}
      >
        {/* <img
          src={getLogoUrl()}
          alt="Football Ivanovo Logo"
          style={{
            width: isMainPage ? '160px' : '180px',
            height: 'auto',
            filter: isMainPage ? 'none' : 'grayscale(70%) opacity(0.5)',
            transform: isMainPage ? 'none' : 'rotate(-8deg)'
          }}
        /> */}
      </div>

      {/* Заголовок страницы */}
      {title && (
        <div 
          style={{
            position: 'absolute',
            top: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            zIndex: 3,
            width: '90%'
          }}
        >
          <div style={{
            fontFamily: 'EdoSZ, sans-serif',
            fontSize: '1.8rem',
            color: isDarkTheme ? 'white' : 'black', // Цвет текста в зависимости от темы
            textShadow: isDarkTheme ? '0 0 5px rgba(255,255,255,0.3)' : 'none', // Тень только для темной темы
            position:'absolute',
            left:'0px',
            lineHeight: 1
          }}>
            {title}
          </div>
        </div>
      )}

      {/* Контент - с прокруткой и защитой от выхода за границы */}
      <div 
        style={{
          position: 'absolute',
          top: title ? '120px' : '40px',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '0 20px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          overscrollBehavior: 'contain',
          maxWidth: '100vw',
          boxSizing: 'border-box',
          scrollBehavior: 'smooth'
        }}
        onScroll={(e) => {
          // Предотвращаем горизонтальную прокрутку
          const target = e.target as HTMLElement;
          if (target.scrollLeft !== 0) {
            target.scrollLeft = 0;
          }
        }}
      >
        <div style={{
          width: '100%',
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: 'fit-content',
          boxSizing: 'border-box'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}
