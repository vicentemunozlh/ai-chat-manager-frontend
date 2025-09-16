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
  const isConnecting = useRef(false);

  const joinChannel = useCallback(
    (convId: string) => {
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

      // Listen for AI responses broadcasted from the backend
      channel.current.on('ai_response', (payload) => {
        const response = payload as {
          message: { content: string; inserted_at: string; id: string };
        };
        const aiMessage = response.message;
        onMessage?.({
          content: aiMessage.content,
          role: 'assistant',
          timestamp: aiMessage.inserted_at,
          id: aiMessage.id,
        });
      });

      channel.current.on('user_typing', (payload) => {
        console.log('User typing:', payload);
      });
    },
    [onMessage, onError]
  );

  const connect = useCallback(() => {
    if (isConnecting.current || socket.current) return;

    try {
      isConnecting.current = true;
      setConnectionStatus('connecting');

      const wsUrl =
        import.meta.env.VITE_CHAT_MANAGER_WS_URL ||
        'ws://localhost:4000/socket';

      socket.current = new Socket(wsUrl, {
        params: { token: userToken || '' },
      });

      socket.current.onOpen(() => {
        console.log('Socket opened, setting connected to true');
        setIsConnected(true);
        setConnectionStatus('connected');
        isConnecting.current = false;
        onConnect?.();
      });

      socket.current.onClose(() => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        isConnecting.current = false;
        onDisconnect?.();
      });

      socket.current.onError((error) => {
        setConnectionStatus('error');
        isConnecting.current = false;
        onError?.(error);
      });

      socket.current.connect();

      if (conversationId) {
        joinChannel(conversationId);
      }
    } catch (error) {
      setConnectionStatus('error');
      isConnecting.current = false;
      console.error('Phoenix socket connection error:', error);
      onError?.(error);
    }
  }, [conversationId, userToken, joinChannel]);

  const sendMessage = (content: string) => {
    console.log(
      'Attempting to send message, isConnected:',
      isConnected,
      'channel:',
      !!channel.current
    );

    // If no channel exists, create a default one for new conversations
    if (!channel.current && isConnected && socket.current) {
      channel.current = socket.current.channel('chat:new', {});
      channel.current.join();
    }

    if (channel.current && isConnected) {
      channel.current
        .push('send_message', { content, role: 'user' })
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
      socket.current = null;
    }
    isConnecting.current = false;
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [conversationId, userToken]);

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
