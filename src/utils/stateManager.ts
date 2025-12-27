/**
 * Утилиты для управления состоянием приложения
 */

// Очистка кэша регистраций
export const clearRegistrationCache = () => {
  // Очищаем localStorage если используется
  if (typeof Storage !== 'undefined') {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('registration') || key.includes('match')) {
        localStorage.removeItem(key);
      }
    });
  }
  
  // Очищаем sessionStorage если используется
  if (typeof Storage !== 'undefined') {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.includes('registration') || key.includes('match')) {
        sessionStorage.removeItem(key);
      }
    });
  }
};

// Принудительная очистка состояния компонента
export const resetComponentState = () => {
  // Можно добавить дополнительную логику очистки
  console.log('Resetting component state');
  clearRegistrationCache();
};

// Утилита для отладки состояния
export const debugState = (componentName: string, state: any) => {
  console.log(`[${componentName}] Current state:`, state);
};