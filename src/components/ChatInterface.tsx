import { useState, useEffect, useRef } from 'react'
import { Send, User, Bot } from 'lucide-react'
import type { Message } from '../types'
import { usePhoenixChannel } from '../hooks/useWebSocket'

interface ChatInterfaceProps {
  conversationId?: string
  onClose?: () => void
}

const ChatInterface = ({ conversationId, onClose }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Phoenix Channel connection for real-time chat
  const { isConnected, sendMessage } = usePhoenixChannel({
    conversationId,
    userToken: 'your-user-token', // Replace with actual token
    onMessage: (payload) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: payload.content as string,
        sender: payload.sender as 'user' | 'ai',
        timestamp: payload.timestamp as string || new Date().toISOString(),
        conversationId: conversationId || 'new'
      }
      setMessages(prev => [...prev, newMessage])
      setIsLoading(false)
    },
    onConnect: () => {
      console.log('Connected to Phoenix channel')
    },
    onDisconnect: () => {
      console.log('Disconnected from Phoenix channel')
    },
    onError: (error) => {
      console.error('Phoenix channel error:', error)
    }
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !isConnected) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
      conversationId: conversationId || 'new'
    }

    setMessages(prev => [...prev, userMessage])
    const messageContent = inputMessage
    setInputMessage('')
    setIsLoading(true)

    // Send message via Phoenix Channel
    const sent = sendMessage(messageContent)
    
    if (!sent) {
      console.error('Failed to send message - not connected')
      setIsLoading(false)
      return
    }

    // Note: AI response will come through the Phoenix channel 'new_message' event
    // Remove the mock response when backend is connected
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Esta es una respuesta simulada a: "${messageContent}". En la implementación real, esta respuesta vendría del backend Phoenix con IA.`,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        conversationId: conversationId || 'new'
      }
      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '800px',
        height: '600px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              {conversationId ? `Conversación ${conversationId}` : 'Nueva Conversación'}
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
              Estado: {isConnected ? 'Conectado' : 'Desconectado'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {messages.length === 0 && (
            <div style={{
              textAlign: 'center',
              color: '#64748b',
              padding: '40px'
            }}>
              Inicia una conversación escribiendo un mensaje
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '70%'
              }}
            >
              {message.sender === 'ai' && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={16} color="white" />
                </div>
              )}
              
              <div style={{
                backgroundColor: message.sender === 'user' ? '#3b82f6' : '#f1f5f9',
                color: message.sender === 'user' ? 'white' : '#1e293b',
                padding: '12px 16px',
                borderRadius: '12px',
                order: message.sender === 'user' ? -1 : 0
              }}>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                  {message.content}
                </p>
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: '12px',
                  opacity: 0.7
                }}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
              
              {message.sender === 'user' && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User size={16} color="white" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={16} color="white" />
              </div>
              <div style={{
                backgroundColor: '#f1f5f9',
                padding: '12px 16px',
                borderRadius: '12px',
                color: '#64748b'
              }}>
                IA está escribiendo...
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '12px'
        }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || !isConnected || isLoading}
            className="btn btn-primary"
            style={{
              opacity: (!inputMessage.trim() || !isConnected || isLoading) ? 0.5 : 1
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
