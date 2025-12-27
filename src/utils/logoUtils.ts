// Утилита для работы с логотипом
export const getLogoUrl = (): string => {
  // Используем фиксированный timestamp для обеспечения единообразия
  const LOGO_VERSION = '1758404952';
  const CACHE_BUSTER = '20241221'; // Обновляйте эту дату при изменении логотипа
  
  return `/logo_v3_${LOGO_VERSION}.svg?v=${CACHE_BUSTER}`;
};

// Функция для принудительной очистки кеша логотипа
export const clearLogoCache = (): void => {
  const images = document.querySelectorAll('img[alt*="Logo"]');
  images.forEach((img: HTMLImageElement) => {
    if (img.src.includes('logo')) {
      const originalSrc = img.src.split('?')[0];
      img.src = `${originalSrc}?v=${Date.now()}`;
    }
  });
};