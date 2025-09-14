import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Star } from 'lucide-react'

const Analytics = () => {
  // Mock data for rating distribution
  const ratingData = [
    { rating: '1⭐', count: 15, fill: '#ef4444' },
    { rating: '2⭐', count: 25, fill: '#f97316' },
    { rating: '3⭐', count: 45, fill: '#eab308' },
    { rating: '4⭐', count: 85, fill: '#22c55e' },
    { rating: '5⭐', count: 160, fill: '#16a34a' }
  ]

  // Mock data for channel distribution
  const channelData = [
    { name: 'Web', value: 45, fill: '#3b82f6' },
    { name: 'WhatsApp', value: 35, fill: '#22c55e' },
    { name: 'Instagram', value: 20, fill: '#ec4899' }
  ]

  // Mock data for worst performing prompts
  const worstPrompts = [
    {
      ranking: 1,
      prompt: 'Respuesta robótica',
      averageRating: 2.1,
      conversations: 45,
      impact: 'Alto impacto negativo'
    },
    {
      ranking: 2,
      prompt: 'Formal extremo',
      averageRating: 2.3,
      conversations: 32,
      impact: 'Alto impacto negativo'
    }
  ]

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    return (
      <div className="rating">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={14}
            className={star <= fullStars ? 'star' : 'star empty'}
            fill={star <= fullStars ? 'currentColor' : 'none'}
          />
        ))}
      </div>
    )
  }

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Análisis detallado del rendimiento de las conversaciones</p>
      </header>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Rating Distribution Chart */}
        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Distribución de Ratings
          </h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
            Cantidad de conversaciones por rating recibido
          </p>
          
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="rating" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  domain={[0, 180]}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel Distribution Pie Chart */}
        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Conversaciones por Canal
          </h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
            Porcentaje de conversaciones por canal de origen
          </p>
          
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color, fontSize: '14px', fontWeight: '500' }}>
                      {value}: {entry.payload.value}%
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Worst Performing Prompts Table */}
      <div className="card">
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
          Top 5 Prompts con Peor Rating
        </h3>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
          Prompts que generaron los ratings más bajos en promedio
        </p>
        
        <table className="table">
          <thead>
            <tr>
              <th>Ranking</th>
              <th>Prompt</th>
              <th>Rating Promedio</th>
              <th>Conversaciones</th>
              <th>Impacto</th>
            </tr>
          </thead>
          <tbody>
            {worstPrompts.map((prompt) => (
              <tr key={prompt.ranking}>
                <td>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {prompt.ranking}
                  </div>
                </td>
                <td style={{ fontWeight: '600' }}>{prompt.prompt}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#dc2626' }}>
                      {prompt.averageRating}
                    </span>
                    {renderStars(prompt.averageRating)}
                  </div>
                </td>
                <td>{prompt.conversations}</td>
                <td>
                  <span className="badge badge-danger">
                    {prompt.impact}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Analytics
