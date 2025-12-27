// Общие типы для приложения

export interface User {
  id: number;
  telegram_id: number;
  username?: string;
  full_name: string;
  is_admin: boolean;
  is_active: boolean;
  in_channel: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Venue {
  id: number;
  name: string;
  address: string;
  surface_type?: string;
  has_showers?: boolean;
  has_drinking_water?: boolean;
  has_parking?: boolean;
  contact_phone?: string;
  notes?: string;
  image_url?: string;
  is_active?: boolean;
}

export interface MatchResult {
  id: number;
  match_id: number;
  winning_team: "red" | "green" | "blue" | "draw";
  red_team_score: number;
  green_team_score: number;
  blue_team_score: number;
  best_player_id?: number;
  best_goal_player_id?: number;
  best_save_player_id?: number;
  best_player?: User;
  best_goal_player?: User;
  best_save_player?: User;
  notes?: string;
  created_at: string;
}

export interface Match {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  venue?: Venue;
  venue_id?: number;
  status: 'open' | 'closed' | 'completed' | 'cancelled';
  max_players: number;
  price: number;
  description?: string;
  current_players?: number;
  reserve_count?: number;
  results?: MatchResult;
  created_at?: string;
  updated_at?: string;
}

export interface Registration {
  id: number;
  user_id: number;
  match_id: number;
  type: 'main_list' | 'reserve';
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
  registered_at: string;
  user?: User;
  match?: Match;
}

export interface Question {
  id: number;
  user_id: number;
  question_text: string;
  answer_text?: string;
  status: 'pending' | 'answered' | 'closed';
  created_at: string;
  answered_at?: string;
  user?: User;
}

export interface RefundRequest {
  id: number;
  user_id?: number;
  match_id?: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'processed';
  reason?: string;
  admin_notes?: string;
  created_at: string;
  processed_at?: string;
  refund_id?: string;
  yookassa_status?: string;
  expected_timeframe?: string;
  status_description?: string;
  user?: {
    id: number;
    username?: string;
    full_name?: string;
  };
  match?: {
    id?: number;
    date: string;
    start_time: string;
    venue: {
      name: string;
    };
  };
}

export interface PlayerStats {
  id: number;
  user_id?: number;
  username?: string;
  full_name?: string;
  created_at?: string;
  wins?: number;
  draws?: number;
  losses?: number;
  total_matches?: number;
  mvp_count?: number;
  best_player_count?: number;
  best_goal_count?: number;
  best_save_count?: number;
}

export interface ChatMessage {
  id: number;
  text: string;
  isAdmin: boolean;
  timestamp: string;
  sender_name?: string;
  read_by_user?: boolean;
  read_by_admin?: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface MatchListResponse {
  matches: Match[];
  total: number;
}

export interface RegistrationListResponse {
  main_list: Registration[];
  reserve: Registration[];
  total_main_list: number;
  total_reserve: number;
}

export interface QuestionListResponse {
  questions: Question[];
  total: number;
}

export interface RefundListResponse {
  refunds: RefundRequest[];
  total: number;
}

// Дополнительные типы для админского API
export interface UserStats {
  total_matches: number;
  wins: number;
  draws: number;
  losses: number;
  mvp_count: number;
  best_goal_count: number;
  best_save_count: number;
  win_rate?: number;
}

export interface SystemStats {
  total_users: number;
  total_matches: number;
  active_matches: number;
  completed_matches: number;
  total_registrations: number;
  pending_refunds: number;
  pending_questions: number;
}

export interface NotificationRequest {
  user_ids: number[];
  message: string;
}

export interface NotificationResponse {
  success: boolean;
  sent_count: number;
  total_count: number;
  message?: string;
}

// Типы для форм
export interface MatchCreateData {
  date: string;
  start_time: string;
  end_time: string;
  venue_id: number;
  price: number;
  description?: string;
}

export interface VenueCreateData {
  name: string;
  address: string;
  surface_type: string;
  capacity?: number;
  has_showers?: boolean;
  has_drinking_water?: boolean;
  has_parking?: boolean;
  contact_phone?: string;
  notes?: string;
  image_url?: string;
}

export interface MatchResultData {
  winning_team: "red" | "green" | "blue" | "draw";
  red_team_score?: number;
  green_team_score?: number;
  blue_team_score?: number;
  best_player_id?: number;
  best_goal_player_id?: number;
  best_save_player_id?: number;
  notes?: string;
}

export interface PaymentCheckResponse {
  success: boolean;
  status: string;
  message: string;
}

export interface PaymentCreateResponse {
  success: boolean;
  payment_id?: string;
  confirmation_url?: string;
  status?: string;
}