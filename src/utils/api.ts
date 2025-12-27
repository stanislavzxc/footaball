// API utilities and error handling

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): never => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Ошибка от сервера
    const message = error.response.data?.detail || error.response.data?.message || 'Ошибка сервера';
    throw new ApiError(message, error.response.status, error.response.data);
  } else if (error.request) {
    // Ошибка сети
    throw new ApiError('Ошибка сети. Проверьте подключение к интернету');
  } else {
    // Другие ошибки
    throw new ApiError(error.message || 'Неизвестная ошибка');
  }
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'short'
  });
};

export const formatTime = (timeString: string): string => {
  // Время приходит с сервера уже в московском часовом поясе (без timezone info)
  // Извлекаем часы и минуты напрямую из строки ISO формата
  // Формат: "2024-11-25T17:30:00" или "2024-11-25T17:30:00.000000"
  const match = timeString.match(/T(\d{2}):(\d{2})/);
  if (match) {
    const hours = match[1];
    const minutes = match[2];
    return `${hours}:${minutes}`;
  }
  
  // Fallback: используем Date
  const time = new Date(timeString);
  
  return time.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Moscow'
  });
};

export const formatDateTime = (dateString: string, timeString?: string): string => {
  if (timeString) {
    return `${formatDate(dateString)} (${formatTime(timeString)})`;
  }
  
  // Если передана только одна строка с датой и временем
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  // Простая реализация уведомлений
  // В будущем можно заменить на более продвинутую библиотеку
  if (type === 'error') {
    alert(`❌ ${message}`);
  } else if (type === 'success') {
    alert(`✅ ${message}`);
  } else {
    alert(`ℹ️ ${message}`);
  }
};