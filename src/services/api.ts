import axios from 'axios';
import { telegramWebApp } from '../utils/telegram';
import { handleApiError } from '../utils/api';
import type { 
  Match, 
  Registration,
  User,
  UserStats
} from '../types';

const apiClient = axios.create({
  // baseURL: '/api/public',
  baseURL: 'https://gonafootball.ru/api/public',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
});

// Отдельный клиент для платежей
const paymentClient = axios.create({
  baseURL: '/api/payments',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавляем интерцептор для обработки ошибок платежей
paymentClient.interceptors.response.use(
  (response) => response,
  (error) => handleApiError(error)
);

// Добавляем интерцептор для предотвращения кэширования
apiClient.interceptors.request.use(
  (config) => {
    // Добавляем timestamp к каждому запросу для предотвращения кэширования
    const separator = config.url?.includes('?') ? '&' : '?';
    config.url = `${config.url}${separator}_t=${Date.now()}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Добавляем интерцептор для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => handleApiError(error)
);

const getUserId = () => telegramWebApp.getUserId();

export const api = {
  getMatches: async (): Promise<Match[]> => {
    const response = await apiClient.get('/matches');
    // console.log(response.data.matches[0].venue.image_url,'&*****^')
    return response.data.matches || response.data;

  },

  getMatch: async (id: number): Promise<Match> => {
    const response = await apiClient.get(`/matches/${id}`);
    return response.data;
  },

  registerForMatch: async (matchId: number): Promise<Registration> => {
    const response = await apiClient.post('/register', {
      match_id: matchId,
      user_id: getUserId()
    });
    return response.data;
  },

  cancelRegistration: async (matchId: number) => {
    const response = await apiClient.delete(`/register/${matchId}?telegram_id=${getUserId()}`);
    return response.data;
  },

  getMatchPlayers: async (matchId: number) => {
    const response = await apiClient.get(`/matches/${matchId}/players`);
    return response.data;
  },

  getMyRegistrations: async (): Promise<Registration[]> => {
    const response = await apiClient.get(`/users/${getUserId()}/registrations`);
    return response.data;
  },

  getUserStats: async (): Promise<UserStats> => {
    const response = await apiClient.get(`/users/${getUserId()}/stats`);
    return response.data;
  },

  askQuestion: async (text: string) => {
    const response = await apiClient.post('/questions', {
      user_id: getUserId(),
      question_text: text
    });
    return response.data;
  },

  getMatchHistory: async (): Promise<Match[]> => {
    // Получаем все завершенные матчи для фильтрации по месяцам
    const response = await apiClient.get('/matches?status=completed&limit=100');
    return response.data.matches || response.data;
  },

  getUserHistory: async () => {
    const response = await apiClient.get(`/users/${getUserId()}/history`);
    return response.data.history || response.data;
  },

  getVenues: async () => {
    const response = await apiClient.get('/venues');
    return response.data.venues || response.data;
  },

  getFAQ: async () => {
    const response = await apiClient.get('/faq');
    return response.data;
  },

  // Создание или получение пользователя
  createOrGetUser: async (): Promise<User> => {
    const userData = telegramWebApp.getUserData();
    if (!userData) {
      throw new Error('Не удалось получить данные пользователя из Telegram');
    }

    const response = await apiClient.post('/users', {
      telegram_id: userData.id,
      username: userData.username,
      first_name: userData.first_name,
      last_name: userData.last_name
    });
    return response.data;
  },

  // Создание платежа
  createPayment: async (registrationId: number, amount: number, returnUrl: string) => {
    const response = await paymentClient.post('/create', {
      registration_id: registrationId,
      amount: amount,
      description: `Оплата участия в матче`,
      return_url: returnUrl
    });
    return response.data;
  },

  // Проверка статуса платежа
  checkPaymentStatus: async (registrationId: number) => {
    const response = await paymentClient.post(`/check/${registrationId}`);
    return response.data;
  },

  // Переход из резерва в основной список
  moveFromReserveToMain: async (matchId: number): Promise<any> => {
    const response = await apiClient.post(`/reserve-to-main/${matchId}`, {
      telegram_id: getUserId()
    });
    return response.data;
  },

  // Проверка статуса администратора
  checkAdminStatus: async (telegramId: number): Promise<{ is_admin: boolean; telegram_id: number }> => {
    const response = await apiClient.get(`/check-admin/${telegramId}`);
    return response.data;
  }
};

export const apiService = api;