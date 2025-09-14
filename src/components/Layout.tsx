import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BarChart3, MessageSquare, PieChart, Settings } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()

  const navItems = [
    {
      path: '/resumen',
      label: 'Resumen',
      icon: BarChart3
    },
    {
      path: '/conversaciones',
      label: 'Conversaciones',
      icon: MessageSquare
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: PieChart
    },
    {
      path: '/configuracion',
      label: 'Configuración',
      icon: Settings
    }
  ]

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>IA Dashboard</h1>
          <p>Análisis de Conversaciones</p>
        </div>
        
        <nav className="navigation">
          <h3>Navegación</h3>
          <ul>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className={`nav-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout
