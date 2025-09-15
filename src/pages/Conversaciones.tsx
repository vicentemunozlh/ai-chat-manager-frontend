import { useState, useEffect } from 'react'
import { Plus, Filter, Star } from 'lucide-react'
import ChatInterface from '../components/ChatInterface'
import { apiRequest, formatDate, formatDuration } from '../utils'
import type { Conversation } from '../types'

const Conversaciones = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('Todos')
  const [selectedRating, setSelectedRating] = useState('Todos')
  const [showChatInterface, setShowChatInterface] = useState(false)
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>()

  const fetchConversations = async () => {
    try {
      const data = await apiRequest('/conversations')
      setConversations(data.conversations || data || [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  // Filter conversations based on selected filters
  const filteredConversations = conversations.filter(conversation => {
    const statusMatch = selectedStatus === 'Todos' || conversation.status === selectedStatus
    const ratingMatch = selectedRating === 'Todos' || conversation.rating >= parseInt(selectedRating)
    return statusMatch && ratingMatch
  })

  const getChannelBadgeClass = (channel: string) => {
    switch (channel) {
      case 'Web': return 'badge-info'
      case 'WhatsApp': return 'badge-success'
      case 'Instagram': return 'badge-warning'
      default: return 'badge-info'
    }
  }

  const getStatusBadgeClass = (status: string) => {
    return status === 'closed' ? 'badge-light' : 'badge-dark'
  }

  const renderStars = (rating: number) => {
    if (rating === 0) return <span>-</span>
    
    return (
      <div className="rating">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'star' : 'star empty'}
            fill={star <= rating ? 'currentColor' : 'none'}
          />
        ))}
      </div>
    )
  }

  const handleCreateNewConversation = async () => {
    try {
      const response = await apiRequest('/conversations', {
        method: 'POST',
        body: JSON.stringify({})
      })
      
      // Set the new conversation ID and open chat
      setSelectedConversationId(response.conversation.id)
      setShowChatInterface(true)
      
      // Add the new conversation to the list
      setConversations(prev => [response.conversation, ...prev])
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }

  const handleConversationClosed = () => {
    // Refresh the conversations list to show updated status and rating
    fetchConversations()
    // Close the chat interface
    setShowChatInterface(false)
    setSelectedConversationId(undefined)
  }

  const handleOpenConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId)
    setShowChatInterface(true)
  }

  const handleCloseChatInterface = () => {
    setShowChatInterface(false)
    setSelectedConversationId(undefined)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Conversaciones</h1>
          <p className="page-subtitle">Gestiona y analiza todas las conversaciones</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={handleCreateNewConversation}
        >
          <Plus size={16} />
          Crear nueva conversación
        </button>
      </header>

      {/* Filters */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Filter size={20} color="#64748b" />
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Filtros</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Estado</label>
            <select 
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="Todos">Todos</option>
              <option value="closed">Cerrada</option>
              <option value="open">Abierta</option>
            </select>
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Rating mínimo</label>
            <select 
              className="form-select"
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
            >
              <option value="Todos">Todos</option>
              <option value="1">1 estrella</option>
              <option value="2">2 estrellas</option>
              <option value="3">3 estrellas</option>
              <option value="4">4 estrellas</option>
              <option value="5">5 estrellas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="card">
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>
          Lista de Conversaciones ({filteredConversations.length})
        </h3>
        
        {filteredConversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            No hay conversaciones que coincidan con los filtros seleccionados
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha de inicio</th>
                <th>Duración</th>
                <th>Estado</th>
                <th>Canal</th>
                <th>Rating</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredConversations.map((conversation) => (
                <tr key={conversation.id}>
                  <td style={{ fontWeight: '600' }}>{conversation.id}</td>
                  <td>{formatDate(conversation.inserted_at)}</td>
                  <td>{conversation.duration_seconds ? formatDuration(conversation.duration_seconds) : '-'}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(conversation.status)}`}>
                      {conversation.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getChannelBadgeClass(conversation.channel)}`}>
                      {conversation.channel}
                    </span>
                  </td>
                  <td>{renderStars(conversation.rating)}</td>
                  <td>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '8px 12px', fontSize: '12px' }}
                      onClick={() => handleOpenConversation(conversation.id)}
                    >
                      Ver detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Chat Interface Modal */}
      {showChatInterface && (
        <ChatInterface
          conversationId={selectedConversationId}
          onClose={handleCloseChatInterface}
          onConversationClosed={handleConversationClosed}
        />
      )}
    </div>
  )
}

export default Conversaciones
