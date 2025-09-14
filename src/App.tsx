import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Conversaciones from './pages/Conversaciones'
import Analytics from './pages/Analytics'
import Configuracion from './pages/Configuracion'
import './App.css'

function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/resumen" replace />} />
          <Route path="/resumen" element={<Dashboard />} />
          <Route path="/conversaciones" element={<Conversaciones />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/configuracion" element={<Configuracion />} />
        </Routes>
      </Layout>
    </div>
  )
}

export default App
