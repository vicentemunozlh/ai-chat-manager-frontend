import { useState, useEffect } from 'react'
import { User, Plus, Edit, Trash2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { apiRequest } from '../utils'

interface Prompt {
  id: string
  title: string
  description: string
  active: boolean
  inserted_at: string
  updated_at: string
}

interface Integration {
  id: string
  endpoint?: string
  default_model?: string
  lastUpdate?: string
  updated_at?: string
}

const Configuracion = () => {
  const { user } = useAuth()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [promptsLoading, setPromptsLoading] = useState(true)
  const [integrationLoading, setIntegrationLoading] = useState(true)
  const [newPromptName, setNewPromptName] = useState('')
  const [newPromptDescription, setNewPromptDescription] = useState('')
  const [integration, setIntegration] = useState<Integration | null>(null)

  // Fetch prompts from API
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const data = await apiRequest('/prompts')
        setPrompts(data.prompts || [])
      } catch (error) {
        console.error('Error fetching prompts:', error)
      } finally {
        setPromptsLoading(false)
      }
    }
    fetchPrompts()
  }, [])

  // Fetch integration from API
  useEffect(() => {
    const fetchIntegration = async () => {
      try {
        const data = await apiRequest('/integrations')
        setIntegration(data.integration)
      } catch (error) {
        console.error('Error fetching integration:', error)
      } finally {
        setIntegrationLoading(false)
      }
    }
    fetchIntegration()
  }, [])

  const handleAddPrompt = async () => {
    if (newPromptName.trim() && newPromptDescription.trim()) {
      try {
        const response = await apiRequest('/prompts', {
          method: 'POST',
          body: JSON.stringify({
            title: newPromptName,
            description: newPromptDescription
          })
        })
        
        setPrompts([...prompts, response.prompt])
        setNewPromptName('')
        setNewPromptDescription('')
      } catch (error) {
        console.error('Error adding prompt:', error)
      }
    }
  }

  const handleSetActive = async (promptId: string) => {
    try {
      await apiRequest(`/prompts/${promptId}/activate`, {
        method: 'PUT'
      })
      setPrompts(prompts.map(prompt => ({
        ...prompt,
        active: prompt.id === promptId
      })))
    } catch (error) {
      console.error('Error setting active prompt:', error)
    }
  }

  const handleDeletePrompt = async (promptId: string) => {
    try {
      await apiRequest(`/prompts/${promptId}`, {
        method: 'DELETE'
      })
      setPrompts(prompts.filter(prompt => prompt.id !== promptId))
    } catch (error) {
      console.error('Error deleting prompt:', error)
    }
  }

  if (promptsLoading || integrationLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Configuración</h1>
        <p className="page-subtitle">Gestiona tu perfil, prompts y configuración de API</p>
      </header>

      {/* User Profile Section */}
      <div className="card">
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>
          Perfil de Usuario
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={32} color="#9ca3af" />
          </div>
          
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
              {user?.name}
            </h4>
            <p style={{ color: '#64748b', marginBottom: '8px' }}>
              {user?.email}
            </p>
            <span className="badge badge-info">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* API Configuration Section */}
      <div className="card">
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
          Configuración de API
        </h3>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
          Configuración de conexión a la API de IA (solo lectura)
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Endpoint</label>
            <input 
              type="text" 
              className="form-input" 
              value={integration?.endpoint || 'N/A'}
              readOnly
              style={{ backgroundColor: '#f8fafc', color: '#64748b' }}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Modelo</label>
            <input 
              type="text" 
              className="form-input" 
              value={integration?.default_model || 'N/A'}
              readOnly
              style={{ backgroundColor: '#f8fafc', color: '#64748b' }}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Última actualización</label>
          <input 
            type="text" 
            className="form-input" 
            value={integration?.updated_at || 'N/A'}
            readOnly
            style={{ backgroundColor: '#f8fafc', color: '#64748b' }}
          />
        </div>
      </div>

      {/* Prompts Management Section */}
      <div className="card">
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
          Prompts Predefinidos
        </h3>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
          Configura y selecciona el prompt activo para las conversaciones
        </p>
        
        {/* Current Prompts */}
        <div style={{ marginBottom: '32px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
            Prompt Activo
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {prompts.map((prompt) => (
              <div 
                key={prompt.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  border: prompt.active ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: prompt.active ? '#eff6ff' : 'white'
                }}
              >
                <input
                  type="radio"
                  name="activePrompt"
                  checked={prompt.active}
                  onChange={() => handleSetActive(prompt.id)}
                  style={{ width: '16px', height: '16px' }}
                />
                
                <div style={{ flex: 1 }}>
                  <h5 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                    {prompt.title}
                    {prompt.active && (
                      <span className="badge badge-info" style={{ marginLeft: '8px', fontSize: '10px' }}>
                        Activo
                      </span>
                    )}
                  </h5>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    {prompt.description}
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary" style={{ padding: '6px 8px' }}>
                    <Edit size={14} />
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '6px 8px', color: '#dc2626' }}
                    onClick={() => handleDeletePrompt(prompt.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Prompt */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
            Añadir Nuevo Prompt
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '16px', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nombre del prompt</label>
              <input
                type="text"
                className="form-input"
                placeholder="ej. Amigable y cercano"
                value={newPromptName}
                onChange={(e) => setNewPromptName(e.target.value)}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Descripción</label>
              <input
                type="text"
                className="form-input"
                placeholder="Describe el comportamiento del prompt"
                value={newPromptDescription}
                onChange={(e) => setNewPromptDescription(e.target.value)}
              />
            </div>
            
            <button 
              className="btn btn-primary"
              onClick={handleAddPrompt}
              disabled={!newPromptName.trim() || !newPromptDescription.trim()}
            >
              <Plus size={16} />
              Añadir Prompt
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Configuracion
