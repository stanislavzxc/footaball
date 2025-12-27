import { useState } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useTelegram } from '../hooks/useTelegram';
import { showNotification } from '../utils/api';

interface AdminAuthProps {
  onAuthSuccess: () => void;
  children: React.ReactNode;
}

export function AdminAuth({ onAuthSuccess, children }: AdminAuthProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { isAuthenticated, isLoading, login } = useAdminAuth();
  const { userId } = useTelegram();

  const handleLogin = async () => {
    if (!userId) {
      showNotification('Не удалось получить Telegram ID', 'error');
      return;
    }

    setIsAuthenticating(true);
    try {
      const success = await login();
      
      if (success) {
        onAuthSuccess();
        showNotification('Авторизация успешна', 'success');
      } else {
        showNotification('Доступ запрещен', 'error');
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      if (error.response?.status === 403) {
        showNotification('У вас нет прав администратора', 'error');
      } else {
        showNotification('Ошибка авторизации', 'error');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #4A90E2 0%, #2E5BBA 50%, #1E3A8A 100%)',
        color: 'white',
        fontSize: '1.2rem',
        fontFamily: 'Inter, sans-serif'
      }}>
        Проверка авторизации...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #4A90E2 0%, #2E5BBA 50%, #1E3A8A 100%)',
        color: 'white',
        fontFamily: 'Inter, sans-serif',
        padding: '20px'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h1 style={{ 
            fontSize: '2rem', 
            marginBottom: '16px',
            fontWeight: '600'
          }}>
            🔐 Админ-панель
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            opacity: 0.9,
            lineHeight: '1.4'
          }}>
            Для доступа к админ-панели необходима авторизация
          </p>
        </div>

        <button
          onClick={handleLogin}
          disabled={isAuthenticating}
          style={{
            width: '280px',
            height: '50px',
            background: 'rgba(255,255,255,0.1)',
            border: '2px solid rgba(255,255,255,0.8)',
            borderRadius: '25px',
            color: 'white',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: isAuthenticating ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)',
            opacity: isAuthenticating ? 0.7 : 1
          }}
        >
          {isAuthenticating ? 'Авторизация...' : 'Войти как администратор'}
        </button>

        <div style={{
          marginTop: '30px',
          fontSize: '0.9rem',
          opacity: 0.7,
          textAlign: 'center',
          lineHeight: '1.4'
        }}>
          <p>Доступ разрешен только администраторам</p>
          <p>Ваш Telegram ID: {userId}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}