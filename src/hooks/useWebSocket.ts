import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket, Channel } from 'phoenix';

interface UsePhoenixChannelOptions {
  conversationId?: string;
  userToken?: string;
  onMessage?: (message: Record<string, unknown>) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: unknown) => void;
}

export const usePhoenixChannel = ({
  conversationId,
  userToken,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
}: UsePhoenixChannelOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('disconnected');

  const socket = useRef<Socket | null>(null);
  const channel = useRef<Channel | null>(null);

  const connect = useCallback(() => {
    try {
      setConnectionStatus('connecting');

      // Create Phoenix Socket
      socket.current = new Socket('/socket', {
        params: { token: userToken || '' },
      });

      socket.current.onOpen(() => {
        setIsConnected(true);
        setConnectionStatus('connected');
        onConnect?.();
      });

      socket.current.onClose(() => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        onDisconnect?.();
      });

      socket.current.onError((error) => {
        setConnectionStatus('error');
        onError?.(error);
      });

      // Connect to socket
      socket.current.connect();

      // Join conversation channel if conversationId provided
      if (conversationId) {
        joinChannel(conversationId);
      }
    } catch (error) {
      setConnectionStatus('error');
      console.error('Phoenix socket connection error:', error);
      onError?.(error);
    }
  }, [conversationId, userToken, onConnect, onDisconnect, onError, onMessage]);

  const joinChannel = (convId: string) => {
    if (!socket.current) return;

    channel.current = socket.current.channel(`chat:${convId}`, {});

    channel.current
      .join()
      .receive('ok', () => {
        console.log('Joined channel successfully');
      })
      .receive('error', (resp) => {
        console.error('Unable to join channel', resp);
        onError?.(resp);
      });

    // Listen for new messages
    channel.current.on('new_message', (payload) => {
      onMessage?.(payload as Record<string, unknown>);
    });

    // Listen for typing indicators
    channel.current.on('user_typing', (payload) => {
      // Handle typing indicator
      console.log('User typing:', payload);
    });
  };

  const sendMessage = (content: string) => {
    if (channel.current && isConnected) {
      channel.current
        .push('send_message', { content })
        .receive('ok', (resp) => {
          console.log('Message sent successfully', resp);
        })
        .receive('error', (resp) => {
          console.error('Error sending message', resp);
          onError?.(resp);
        });
      return true;
    }
    return false;
  };

  const sendTyping = () => {
    if (channel.current && isConnected) {
      channel.current.push('typing', {});
    }
  };

  const disconnect = () => {
    if (channel.current) {
      channel.current.leave();
    }
    if (socket.current) {
      socket.current.disconnect();
    }
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect]);

  return {
    isConnected,
    connectionStatus,
    sendMessage,
    sendTyping,
    disconnect,
    reconnect: connect,
    joinChannel,
  };
};

// Mock WebSocket URL for development
export const getWebSocketUrl = () => {
  // In production, this would be your Phoenix WebSocket endpoint
  // return 'ws://localhost:4000/socket/websocket'

  // For development, we'll return a mock URL
  return 'ws://localhost:4000/socket/websocket';
};
