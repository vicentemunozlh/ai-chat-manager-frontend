import { useState } from 'react'
import { Plus, Filter, Calendar, Star } from 'lucide-react'
import ChatInterface from '../components/ChatInterface'

interface Conversation {
  id: string
  startDate: string
  duration: string
  status: 'Cerrada' | 'Abierta'
  channel: 'Web' | 'WhatsApp' | 'Instagram'
  rating: number
}

const Conversaciones = () => {
  const [selectedStatus, setSelectedStatus] = useState('Todos')
  const [selectedRating, setSelectedRating] = useState('Todos')
  const [showChatInterface, setShowChatInterface] = useState(false)
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>()

  // Mock conversations data
  const conversations: Conversation[] = [
    {
      id: 'CONV-001',
      startDate: '2024-01-15 14:30',
      duration: '5m 23s',
      status: 'Cerrada',
      channel: 'Web',
      rating: 5
    },
    {
      id: 'CONV-002',
      startDate: '2024-01-15 13:45',
      duration: '3m 12s',
      status: 'Cerrada',
      channel: 'WhatsApp',
      rating: 3
    },
    {
      id: 'CONV-003',
      startDate: '2024-01-15 12:20',
      duration: '7m 45s',
      status: 'Abierta',
      channel: 'Instagram',
      rating: 0
    },
    {
      id: 'CONV-004',
      startDate: '2024-01-15 11:10',
      duration: '2m 56s',
      status: 'Cerrada',
      channel: 'Web',
      rating: 3
    }
  ]

  const getChannelBadgeClass = (channel: string) => {
    switch (channel) {
      case 'Web': return 'badge-info'
      case 'WhatsApp': return 'badge-success'
      case 'Instagram': return 'badge-warning'
      default: return 'badge-info'
    }
  }

  const getStatusBadgeClass = (status: string) => {
    return status === 'Cerrada' ? 'badge-success' : 'badge-danger'
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

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Conversaciones</h1>
          <p className="page-subtitle">Gestiona y analiza todas las conversaciones</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setSelectedConversationId(undefined)
            setShowChatInterface(true)
          }}
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
              <option value="Cerrada">Cerrada</option>
              <option value="Abierta">Abierta</option>
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
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Rango de fechas</label>
            <button className="form-input" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start', cursor: 'pointer' }}>
              <Calendar size={16} color="#64748b" />
              Seleccionar fechas
            </button>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="card">
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>
          Lista de Conversaciones
        </h3>
        
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
            {conversations.map((conversation) => (
              <tr key={conversation.id}>
                <td style={{ fontWeight: '600' }}>{conversation.id}</td>
                <td>{conversation.startDate}</td>
                <td>{conversation.duration}</td>
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
                    onClick={() => {
                      setSelectedConversationId(conversation.id)
                      setShowChatInterface(true)
                    }}
                  >
                    Ver detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chat Interface Modal */}
      {showChatInterface && (
        <ChatInterface
          conversationId={selectedConversationId}
          onClose={() => {
            setShowChatInterface(false)
            setSelectedConversationId(undefined)
          }}
        />
      )}
    </div>
  )
}

export default Conversaciones
