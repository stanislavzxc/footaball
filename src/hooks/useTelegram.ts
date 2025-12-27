import { useEffect, useState, useCallback } from 'react';
import { telegramWebApp } from '../utils/telegram';
export const useTelegram = () => {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState(telegramWebApp.getUserData());
  const [theme, setTheme] = useState(telegramWebApp.getTheme());
  const [viewportHeight, setViewportHeight] = useState(telegramWebApp.getViewportHeight());

  const updateViewport = useCallback(() => {
    const newHeight = telegramWebApp.getViewportHeight();
    setViewportHeight(newHeight);
  }, []);

  useEffect(() => {
    // Инициализируем Telegram WebApp
    telegramWebApp.init();
    
    // Обновляем данные пользователя и тему
    setUser(telegramWebApp.getUserData());
    setTheme(telegramWebApp.getTheme());
    
    // Устанавливаем начальную высоту viewport
    setViewportHeight(telegramWebApp.getViewportHeight());
    
    // Слушаем изменения viewport
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);
    
    // Дополнительная проверка для iPhone
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      // Принудительно обновляем viewport через небольшие интервалы
      const intervalId = setInterval(updateViewport, 1000);
      setTimeout(() => clearInterval(intervalId), 10000); // Останавливаем через 10 секунд
    }
    
    setIsReady(true);
    
    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, [updateViewport]);

  return {
    isReady,
    user,
    theme,
    webApp: telegramWebApp,
    isInTelegram: telegramWebApp.isInTelegram(),
    userId: telegramWebApp.getUserId(),
    viewportHeight,
    viewportStableHeight: telegramWebApp.getViewportStableHeight(),
    isExpanded: telegramWebApp.isExpanded()
  };
};