import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { apiRequest } from '../utils'

interface DashboardStats {
  today_conversations: number
  yesterday_conversations: number
  last_week_high_rating_percentage: number
  high_rating_percentage: number
  average_ai_response_time: number
  last_week_average_ai_response_time: number
  this_week_conversations: number
  last_week_conversations: number
  conversations_per_day_this_week: Record<string, number>
}

interface DashboardResponse {
  stats: DashboardStats
}

interface ChartData {
  day: string
  conversations: number
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch all dashboard data from single endpoint
        const response: DashboardResponse = await apiRequest('/stats')
        setStats(response.stats)
        
        // Transform the conversations_per_day_this_week into chart data
        const chartData = Object.entries(response.stats.conversations_per_day_this_week).map(([date, count]) => {
          const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
          const dayIndex = new Date(date).getDay()
          return {
            day: dayNames[dayIndex],
            conversations: count
          }
        })
        setChartData(chartData)
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setStats(null)
        setChartData([])
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Helper function to calculate percentage change
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%'
    const change = ((current - previous) / previous) * 100
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}%`
  }

  // Helper function to calculate time change
  const calculateTimeChange = (current: number, previous: number) => {
    const change = (current - previous) / 1000 // Convert to seconds
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}s`
  }

  // Format stats for display
  const formattedStats = stats ? [
    {
      title: 'Conversaciones Hoy',
      value: stats.today_conversations.toString(),
      description: 'Total de conversaciones iniciadas',
      change: calculatePercentageChange(stats.today_conversations, stats.yesterday_conversations) + ' vs ayer',
      changeType: stats.this_week_conversations >= stats.last_week_conversations ? 'positive' as const : 'negative' as const
    },
    {
      title: 'Satisfacción',
      value: `${stats.high_rating_percentage.toFixed(1)}%`,
      description: 'Conversaciones con rating ≥4',
      change: calculatePercentageChange(stats.high_rating_percentage, stats.last_week_high_rating_percentage) + ' vs 7 días previos',
      changeType: stats.high_rating_percentage >= stats.last_week_high_rating_percentage ? 'positive' as const : 'negative' as const
    },
    {
      title: 'Tiempo Respuesta',
      value: `${(stats.average_ai_response_time / 1000).toFixed(1)}s`,
      description: 'Promedio de respuesta de IA',
      change: calculateTimeChange(stats.average_ai_response_time, stats.last_week_average_ai_response_time) + ' vs 7 días previos',
      changeType: stats.average_ai_response_time <= stats.last_week_average_ai_response_time ? 'positive' as const : 'negative' as const
    },
    {
      title: 'Conversaciones Últimos 7 Días',
      value: stats.this_week_conversations.toLocaleString(),
      description: 'Total',
      change: calculatePercentageChange(stats.this_week_conversations, stats.last_week_conversations) + ' vs 7 días previos',
      changeType: stats.this_week_conversations >= stats.last_week_conversations ? 'positive' as const : 'neutral' as const
    }
  ] : []

  if (loading) {
    return (
      <div>
        <header className="page-header">
          <h1 className="page-title">Resumen</h1>
          <p className="page-subtitle">Vista general del rendimiento de las conversaciones con IA</p>
        </header>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Cargando datos del dashboard...
        </div>
      </div>
    )
  }

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Resumen</h1>
        <p className="page-subtitle">Vista general del rendimiento de las conversaciones con IA</p>
      </header>

      {/* KPI Cards */}
      <div className="stats-grid">
        {formattedStats.map((stat, index) => (
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
          Conversaciones por día en los últimos 7 días
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
                domain={[0, 'dataMax + 1']}
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
