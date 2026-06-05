import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Footer from './components/Footer'
import AppRouter from './routes/AppRouter'

export default function App() {
  const { isAuthenticated } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location])

  return (
    <div className="app">
      <Navbar onBurgerClick={() => setSidebarOpen(true)} showBurger={isAuthenticated} />
      <div className="layout">
        {isAuthenticated && (
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        <main className={`content ${isAuthenticated ? 'with-sidebar' : ''}`}>
          <AppRouter />
        </main>
      </div>
      <Footer />
    </div>
  )
}