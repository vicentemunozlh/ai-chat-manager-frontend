export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Conversation {
  id: string;
  inserted_at: string;
  duration: string;
  status: 'Cerrada' | 'Abierta';
  channel: 'Web' | 'WhatsApp' | 'Instagram';
  rating: number;
  messages?: Message[];
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  conversationId: string;
}

export interface Prompt {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  content?: string;
}

export interface KPIData {
  title: string;
  value: string;
  description: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}

export interface ChartData {
  day?: string;
  conversations?: number;
  rating?: string;
  count?: number;
  name?: string;
  value?: number;
  fill?: string;
}

export interface ApiConfig {
  endpoint: string;
  model: string;
  lastUpdate: string;
}

export interface WebSocketMessage {
  type: 'new_conversation' | 'message' | 'conversation_end' | 'rating_update';
  data: Record<string, unknown>;
  timestamp: string;
}

export interface ConversationFilters {
  status: string;
  rating: string;
  dateRange?: {
    start: string;
    end: string;
  };
  channel?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expires_in: number;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
