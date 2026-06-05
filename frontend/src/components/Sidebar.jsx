import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Gamepad2, LayoutGrid, ShoppingCart, Package, Tag, X } from 'lucide-react'
import api from '../services/api'
import { useCart } from '../contexts/CartContext'

export default function Sidebar({ open, onClose }) {
  const [games, setGames] = useState([])
  const { count } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    api
      .get('/games/')
      .then((res) => setGames(res.data.results || res.data))
      .catch(() => {})
  }, [])

  const goToGame = (gameId) => {
    navigate(`/?game=${gameId}`)
    onClose()
  }

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <button className="sidebar-close" onClick={onClose}>
          <X size={22} />
        </button>

        <div className="sidebar-section">
          <p className="sidebar-label">Навигация</p>
          <NavLink to="/" className="sidebar-link" end>
            <LayoutGrid size={18} />
            <span>Каталог</span>
          </NavLink>
          <NavLink to="/cart" className="sidebar-link">
            <ShoppingCart size={18} />
            <span>Корзина</span>
            {count > 0 && <span className="sidebar-badge">{count}</span>}
          </NavLink>
          <NavLink to="/orders" className="sidebar-link">
            <Package size={18} />
            <span>Мои заказы</span>
          </NavLink>
          <NavLink to="/my-accounts" className="sidebar-link">
            <Tag size={18} />
            <span>Мои объявления</span>
          </NavLink>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-label">Игры</p>
          <div className="sidebar-games">
            {games.length === 0 && <p className="sidebar-empty">Нет игр</p>}
            {games.map((g) => (
              <button key={g.id} className="sidebar-game" onClick={() => goToGame(g.id)}>
                <Gamepad2 size={16} />
                <span>{g.title}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  )
}