import { useState, useEffect, useRef } from 'react'
import { Send, User, Bot, Star, ArrowLeft } from 'lucide-react'
import type { Message } from '../types'
import { usePhoenixChannel } from '../hooks/useWebSocket'
import { useAuth } from '../hooks/useAuth'
import { apiRequest } from '../utils'

interface ChatInterfaceProps {
  conversationId?: string
  onClose?: () => void
  onConversationClosed?: () => void
}

const ChatInterface = ({ conversationId, onClose, onConversationClosed }: ChatInterfaceProps) => {
  const { accessToken } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationStatus, setConversationStatus] = useState<'Abierta' | 'Cerrada' | 'closed' | 'open'>('Abierta')
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)
  const [isClosingConversation, setIsClosingConversation] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch chat history when conversationId changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId) return
      
      try {
        const data = await apiRequest(`/conversations/${conversationId}`)
        
        // Map backend message format to frontend format
        const formattedMessages = (data.messages || []).map((msg: { id: string; content: string; role: string; inserted_at: string }) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: msg.inserted_at,
          conversationId: conversationId
        }))
        
        setMessages(formattedMessages)
        // In the fetchMessages function, normalize the status
        setConversationStatus(
          data.conversation?.status === 'closed' ? 'Cerrada' : 
          data.conversation?.status === 'open' ? 'Abierta' : 
          data.conversation?.status || 'Abierta'
        )
      } catch (error) {
        console.error('Error fetching messages:', error)
        setMessages([])
      }
    }
    
    fetchMessages()
  }, [conversationId])

  // Phoenix Channel connection for real-time chat
  const { isConnected, sendMessage } = usePhoenixChannel({
    conversationId,
    userToken: accessToken || '',
    onMessage: (payload) => {
      const newMessage: Message = {
        id: payload.id as string || Date.now().toString(),
        content: payload.content as string,
        role: payload.role as 'user' | 'assistant',
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
    if (!inputMessage.trim() || !isConnected || isConversationClosed) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date().toISOString(),
      conversationId: conversationId || 'new'
    }

    setMessages(prev => [...prev, userMessage])
    const messageContent = inputMessage
    setInputMessage('')
    setIsLoading(true)

    const sent = sendMessage(messageContent)
    
    if (!sent) {
      console.error('Failed to send message - not connected')
      setIsLoading(false)
      return
    }
  }

  const handleCloseConversation = () => {
    setShowRatingModal(true)
  }

  const handleRatingSubmit = async () => {
    if (selectedRating === 0) return

    setIsClosingConversation(true)
    try {
      await apiRequest(`/conversations/${conversationId}/close`, {
        method: 'PUT',
        body: JSON.stringify({ rating: selectedRating, status: "closed" })
      })
      
      setConversationStatus('Cerrada')
      setShowRatingModal(false)
      onConversationClosed?.()
    } catch (error) {
      console.error('Error closing conversation:', error)
    } finally {
      setIsClosingConversation(false)
    }
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

  const isConversationClosed = conversationStatus === 'Cerrada' || conversationStatus === 'closed'

  return (
    <>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ArrowLeft size={16} />
              </button>
            </div>
            
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                {conversationId ? `Conversación ${conversationId}` : 'Nueva Conversación'}
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                Estado: {isConnected ? 'Conectado' : 'Desconectado'} • {conversationStatus}
              </p>
            </div>
            
            <div>
              {!isConversationClosed && (
                <button
                  onClick={handleCloseConversation}
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  Finalizar
                </button>
              )}
            </div>
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
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '70%'
                }}
              >
                {message.role === 'assistant' && (
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
                  backgroundColor: message.role === 'user' ? '#3b82f6' : '#f1f5f9',
                  color: message.role === 'user' ? 'white' : '#1e293b',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  order: message.role === 'user' ? -1 : 0
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
                
                {message.role === 'user' && (
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
              placeholder={isConversationClosed ? "Esta conversación está cerrada" : "Escribe tu mensaje..."}
              disabled={isConversationClosed}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                opacity: isConversationClosed ? 0.5 : 1,
                cursor: isConversationClosed ? 'not-allowed' : 'text'
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || !isConnected || isLoading || isConversationClosed}
              className="btn btn-primary"
              style={{
                opacity: (!inputMessage.trim() || !isConnected || isLoading || isConversationClosed) ? 0.5 : 1
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
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
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            width: '400px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>
              Califica esta conversación
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#64748b' }}>
              ¿Cómo calificarías la atención recibida?
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSelectedRating(rating)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <Star
                    size={32}
                    color={rating <= selectedRating ? '#fbbf24' : '#d1d5db'}
                    fill={rating <= selectedRating ? '#fbbf24' : 'none'}
                  />
                </button>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowRatingModal(false)}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleRatingSubmit}
                disabled={selectedRating === 0 || isClosingConversation}
                style={{
                  background: selectedRating === 0 ? '#d1d5db' : '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: selectedRating === 0 ? 'not-allowed' : 'pointer',
                  opacity: isClosingConversation ? 0.5 : 1
                }}
              >
                {isClosingConversation ? 'Cerrando...' : 'Cerrar Conversación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatInterface
