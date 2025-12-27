import axios from "axios";
import { handleApiError } from "../utils/api";
import type {
  Match,
  User,
  Registration,
  Question,
  RefundRequest,
  PlayerStats,
  Venue,
  MatchListResponse,
  RegistrationListResponse,
  QuestionListResponse,
  RefundListResponse,
  ApiResponse,
  MatchCreateData,
  VenueCreateData,
  MatchResultData,
  NotificationRequest,
  NotificationResponse,
  SystemStats
} from "../types";

const adminApiClient = axios.create({
  baseURL: "/api/admin",
  timeout: 60000, // Увеличиваем таймаут до 60 секунд для загрузки файлов
  headers: {
    "Content-Type": "application/json",
  },
});

// Добавляем интерцептор для добавления заголовков авторизации
adminApiClient.interceptors.request.use((config) => {
  // Пытаемся получить telegram_id для авторизации
  const telegramId = localStorage.getItem("admin_telegram_id");
  const adminToken = localStorage.getItem("admin_token");
  
  if (telegramId) {
    config.headers["X-Telegram-User-Id"] = telegramId;
  } else if (adminToken) {
    config.headers["Authorization"] = `Bearer ${adminToken}`;
  }
  
  return config;
});

// Добавляем интерцептор для обработки ошибок
adminApiClient.interceptors.response.use(
  (response) => response,
  (error) => handleApiError(error)
);

export const adminApi = {
  // Авторизация
  loginViaTelegram: async (telegramId: number) => {
    const response = await adminApiClient.post("/auth/login-telegram", {
      telegram_id: telegramId
    });
    
    if (response.data.success) {
      localStorage.setItem("admin_telegram_id", telegramId.toString());
      localStorage.setItem("admin_token", response.data.token);
    }
    
    return response.data;
  },

  checkAuth: async () => {
    try {
      const response = await adminApiClient.post("/auth/check-token");
      return response.data;
    } catch (error) {
      // Очищаем токены при ошибке авторизации
      localStorage.removeItem("admin_telegram_id");
      localStorage.removeItem("admin_token");
      throw error;
    }
  },

  // Матчи
  getMatches: async (status?: string): Promise<MatchListResponse> => {
    const params = status ? { status_filter: status } : {};
    const response = await adminApiClient.get("/matches", { params });
    return response.data;
  },

  createMatch: async (matchData: MatchCreateData): Promise<Match> => {
    const response = await adminApiClient.post("/matches", matchData);
    return response.data;
  },

  getMatchWithResults: async (matchId: number): Promise<Match> => {
    const response = await adminApiClient.get(`/matches/${matchId}`);
    return response.data;
  },

  updateMatchResults: async (
    matchId: number,
    results: MatchResultData
  ): Promise<Match> => {
    const response = await adminApiClient.put(
      `/matches/${matchId}/results`,
      results
    );
    return response.data;
  },

  getMatchRegistrations: async (
    matchId: number
  ): Promise<RegistrationListResponse> => {
    const response = await adminApiClient.get(
      `/users/registrations/${matchId}`
    );
    return response.data;
  },

  removePlayerRegistration: async (
    registrationId: number
  ): Promise<ApiResponse<void>> => {
    const response = await adminApiClient.delete(
      `/users/registrations/${registrationId}`
    );
    return response.data;
  },

  addPlayerToMatch: async (
    matchId: number,
    username: string
  ): Promise<Registration> => {
    const response = await adminApiClient.post(
      `/matches/${matchId}/add-player`,
      { username }
    );
    return response.data;
  },

  // Пользователи
  getAllUsers: async (): Promise<User[]> => {
    const response = await adminApiClient.get("/users");
    return response.data;
  },

  getUserStats: async (): Promise<PlayerStats[]> => {
    const response = await adminApiClient.get("/stats/players");
    // API теперь возвращает массив напрямую
    if (Array.isArray(response.data)) {
      return response.data.map((player: any) => ({
        id: player.user_id || player.id,
        user_id: player.user_id,
        username: player.username,
        full_name: player.full_name,
        created_at: player.created_at,
        wins: player.wins || 0,
        draws: player.draws || 0,
        losses: player.losses || 0,
        total_matches: player.total_matches || 0,
        mvp_count: player.best_player_count || 0,
        best_goal_count: player.best_goal_count || 0,
        best_save_count: player.best_save_count || 0
      }));
    }
    return [];
  },

  // Вопросы
  getQuestions: async (status?: string): Promise<QuestionListResponse> => {
    const params = status ? { status_filter: status } : {};
    const response = await adminApiClient.get("/questions", { params });
    return response.data;
  },

  answerQuestion: async (
    questionId: number,
    answer: string
  ): Promise<Question> => {
    const response = await adminApiClient.put(
      `/questions/${questionId}/answer`,
      {
        answer,
      }
    );
    return response.data;
  },

  closeQuestion: async (questionId: number): Promise<ApiResponse<void>> => {
    const response = await adminApiClient.post(
      `/questions/${questionId}/close`
    );
    return response.data;
  },

  // Возвраты
  getRefunds: async (status?: string): Promise<RefundListResponse> => {
    const params = status ? { status_filter: status } : {};
    const response = await adminApiClient.get("/refunds", { params });
    return response.data;
  },

  processRefund: async (
    refundId: number,
    status: "approved" | "rejected" | "completed",
    notes?: string
  ): Promise<RefundRequest> => {
    const response = await adminApiClient.put(`/refunds/${refundId}`, {
      status,
      admin_notes: notes,
    });
    return response.data;
  },

  approveRefund: async (refundId: number, notes?: string): Promise<RefundRequest> => {
    const response = await adminApiClient.post(`/refunds/${refundId}/approve`, {
      admin_notes: notes,
    });
    return response.data;
  },

  rejectRefund: async (refundId: number, reason: string): Promise<RefundRequest> => {
    const response = await adminApiClient.post(`/refunds/${refundId}/reject`, {
      admin_notes: reason,
    });
    return response.data;
  },

  checkRefundStatus: async (refundId: number): Promise<{
    success: boolean;
    refund_request_id: number;
    internal_status: string;
    yookassa_status?: string;
    message: string;
    expected_timeframe?: string;
    amount?: number;
    refund_id?: string;
    created_at?: string;
    last_checked: string;
    error?: string;
  }> => {
    const response = await adminApiClient.post(`/refunds/check/${refundId}`);
    return response.data;
  },

  // Уведомления
  sendNotification: async (
    notificationData: NotificationRequest
  ): Promise<NotificationResponse> => {
    const response = await adminApiClient.post("/notifications/send", {
      user_ids: notificationData.user_ids,
      message: notificationData.message,
    });
    return response.data;
  },

  broadcastNotification: async (
    message: string,
    toAdminsOnly: boolean = false
  ): Promise<NotificationResponse> => {
    const response = await adminApiClient.post(
      "/notifications/broadcast",
      null,
      {
        params: {
          message,
          to_admins_only: toAdminsOnly,
        },
      }
    );
    return response.data;
  },

  // Площадки
  getVenues: async (): Promise<Venue[]> => {
    const response = await adminApiClient.get("/venues");
    return response.data;
  },

  createVenue: async (venueData: VenueCreateData): Promise<Venue> => {
    const response = await adminApiClient.post("/venues", venueData);
    return response.data;
  },

  updateVenue: async (
    venueId: number,
    venueData: Partial<VenueCreateData>
  ): Promise<Venue> => {
    const response = await adminApiClient.put(`/venues/${venueId}`, venueData);
    return response.data;
  },

  deleteVenue: async (
    venueId: number,
    force: boolean = false
  ): Promise<ApiResponse<void>> => {
    const response = await adminApiClient.delete(`/venues/${venueId}`, {
      params: { force },
    });
    return response.data;
  },

  // Матчи - дополнительные методы
  deleteMatch: async (
    matchId: number,
    force: boolean = false
  ): Promise<ApiResponse<void>> => {
    const response = await adminApiClient.delete(`/matches/${matchId}`, {
      params: { force },
    });
    return response.data;
  },

  // Статистика
  getSystemStats: async (): Promise<SystemStats> => {
    const response = await adminApiClient.get("/stats");
    return response.data;
  },

  // Логи
  getLogs: async (params?: {
    limit?: number;
    offset?: number;
    log_type?: string;
    level?: string;
    user_id?: number;
  }) => {
    const response = await adminApiClient.get("/logs", { params });
    return response.data;
  },

  getLogTypes: async () => {
    const response = await adminApiClient.get("/logs/types");
    return response.data;
  },

  createTestLog: async (message: string, log_type: string = "system", level: string = "info") => {
    const response = await adminApiClient.post("/logs/test", null, {
      params: { message, log_type, level }
    });
    return response.data;
  },

  // Чат
  getChatUsers: async (onlyUnread: boolean = false) => {
    const response = await adminApiClient.get("/chat/users", {
      params: { only_unread: onlyUnread }
    });
    return response.data;
  },

  getChatHistory: async (userId: number, limit: number = 20) => {
    const response = await adminApiClient.get(`/chat/history/${userId}`, {
      params: { limit }
    });
    return response.data;
  },

  sendChatMessage: async (userId: number, messageText: string) => {
    const response = await adminApiClient.post(`/chat/send/${userId}`, {
      message_text: messageText
    });
    return response.data;
  },

  getChatUnreadSummary: async () => {
    const response = await adminApiClient.get("/chat/unread-summary");
    return response.data;
  },

  markChatAsRead: async (userId: number) => {
    const response = await adminApiClient.post(`/chat/mark-read/${userId}`);
    return response.data;
  },

  // Отправка сообщения пользователю через бота
  sendMessageToUser: async (userId: number, messageText: string) => {
    const response = await adminApiClient.post(`/messages/send-to-user`, {
      user_id: userId,
      message_text: messageText
    });
    return response.data;
  },

  // Excel экспорт/импорт
  exportPlayerStats: async (): Promise<Blob> => {
    const response = await adminApiClient.get("/excel/export-stats", {
      responseType: 'blob',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });
    
    // Проверяем заголовки ответа
    const contentType = response.headers['content-type'];
    const contentLength = response.headers['content-length'];
    
    console.log('Export response info:', {
      status: response.status,
      contentType,
      contentLength,
      dataSize: response.data.size
    });

    // Проверяем размер файла
    if (response.data.size === 0) {
      throw new Error('Received empty file from server');
    }
    
    // Создаем правильный blob с принудительным MIME-типом
    return new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  },

  importPlayerStats: async (file: File): Promise<{
    success: boolean;
    updated_count: number;
    created_count?: number;
    total_processed?: number;
    errors: string[];
    message: string;
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('Starting Excel import...', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
    
    const response = await adminApiClient.post("/excel/import-stats", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 120000, // 2 минуты для импорта файлов
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        console.log(`Upload progress: ${percentCompleted}%`);
      }
    });
    
    console.log('Excel import completed:', response.data);
    return response.data;
  },

  downloadExcelTemplate: async (): Promise<Blob> => {
    const response = await adminApiClient.get("/excel/template", {
      responseType: 'blob',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });
    
    // Проверяем заголовки ответа
    const contentType = response.headers['content-type'];
    const contentLength = response.headers['content-length'];
    
    console.log('Template response info:', {
      status: response.status,
      contentType,
      contentLength,
      dataSize: response.data.size
    });

    // Проверяем размер файла
    if (response.data.size === 0) {
      throw new Error('Received empty template from server');
    }
    
    // Создаем правильный blob с принудительным MIME-типом
    return new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  },
};

export default adminApi;
