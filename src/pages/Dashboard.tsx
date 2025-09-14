import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'

const Dashboard = () => {
  // Mock data based on your design
  const stats = [
    {
      title: 'Conversaciones Hoy',
      value: '127',
      description: 'Total de conversaciones iniciadas',
      change: '+12% vs ayer',
      changeType: 'positive'
    },
    {
      title: 'Satisfacción',
      value: '94.2%',
      description: 'Conversaciones con rating ≥4',
      change: '+2.1% vs semana pasada',
      changeType: 'positive'
    },
    {
      title: 'Tiempo Respuesta',
      value: '1.3s',
      description: 'Promedio de respuesta de IA',
      change: '-0.2s mejora',
      changeType: 'positive'
    },
    {
      title: 'Conversaciones Semana',
      value: '1,247',
      description: 'Total semanal',
      change: 'Estable',
      changeType: 'neutral'
    }
  ]

  // Mock chart data for conversations volume
  const chartData = [
    { day: 'Lun', conversations: 45 },
    { day: 'Mar', conversations: 52 },
    { day: 'Mié', conversations: 48 },
    { day: 'Jue', conversations: 61 },
    { day: 'Vie', conversations: 55 },
    { day: 'Sáb', conversations: 38 },
    { day: 'Dom', conversations: 42 }
  ]

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Resumen</h1>
        <p className="page-subtitle">Vista general del rendimiento de las conversaciones con IA</p>
      </header>

      {/* KPI Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <span className="stat-title">{stat.title}</span>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-description">{stat.description}</div>
            <div className={`stat-change ${stat.changeType}`}>
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Volume Chart */}
      <div className="card">
        <h3 style={{ marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>
          Volumen de Conversaciones
        </h3>
        <p style={{ marginBottom: '24px', color: '#64748b', fontSize: '14px' }}>
          Conversaciones por día en la última semana
        </p>
        
        <div style={{ height: '400px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                domain={[0, 80]}
              />
              <Line 
                type="monotone" 
                dataKey="conversations" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
