import { format, parseISO } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';

// Utility function for class names
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Date formatting utilities
export const formatDate = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd HH:mm');
};

export const formatDateShort = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd');
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

// Status and badge utilities
export const getStatusBadgeClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'cerrada':
    case 'closed':
      return 'badge-success';
    case 'abierta':
    case 'open':
      return 'badge-danger';
    default:
      return 'badge-info';
  }
};

export const getChannelBadgeClass = (channel: string) => {
  switch (channel.toLowerCase()) {
    case 'web':
      return 'badge-info';
    case 'whatsapp':
      return 'badge-success';
    case 'instagram':
      return 'badge-warning';
    default:
      return 'badge-info';
  }
};

export const getRatingColor = (rating: number) => {
  if (rating >= 4) return '#22c55e'; // green
  if (rating >= 3) return '#eab308'; // yellow
  return '#ef4444'; // red
};

// API utilities
export const API_BASE_URL =
  import.meta.env.VITE_CHAT_MANAGER_API_BASE_URL || 'http://localhost:4000/api';

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(localStorage.getItem('access_token') && {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Local storage utilities
export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  set: (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
};

// Mock data generators for development
export const generateMockConversations = (count: number = 10) => {
  const channels = ['Web', 'WhatsApp', 'Instagram'];
  const statuses = ['Cerrada', 'Abierta'];

  return Array.from({ length: count }, (_, i) => ({
    id: `CONV-${String(i + 1).padStart(3, '0')}`,
    startDate: format(
      new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      'yyyy-MM-dd HH:mm'
    ),
    duration: formatDuration(Math.floor(Math.random() * 600) + 60),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    channel: channels[Math.floor(Math.random() * channels.length)],
    rating: Math.floor(Math.random() * 5) + 1,
  }));
};

export const generateMockKPIs = () => [
  {
    title: 'Conversaciones Hoy',
    value: String(Math.floor(Math.random() * 200) + 50),
    description: 'Total de conversaciones iniciadas',
    change: `+${Math.floor(Math.random() * 20)}% vs ayer`,
    changeType: 'positive' as const,
  },
  {
    title: 'Satisfacción',
    value: `${(Math.random() * 10 + 90).toFixed(1)}%`,
    description: 'Conversaciones con rating ≥4',
    change: `+${(Math.random() * 5).toFixed(1)}% vs semana pasada`,
    changeType: 'positive' as const,
  },
  {
    title: 'Tiempo Respuesta',
    value: `${(Math.random() * 2 + 0.5).toFixed(1)}s`,
    description: 'Promedio de respuesta de IA',
    change: `-${(Math.random() * 0.5).toFixed(1)}s mejora`,
    changeType: 'positive' as const,
  },
  {
    title: 'Conversaciones Semana',
    value: String(Math.floor(Math.random() * 2000) + 1000),
    description: 'Total semanal',
    change: 'Estable',
    changeType: 'neutral' as const,
  },
];
