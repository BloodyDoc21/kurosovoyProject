import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Package, Tag, LogOut, ChevronDown, Menu } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'


const MEDIA_BASE = 'http://127.0.0.1:8000'

export default function Navbar({ onBurgerClick, showBurger }) {
  const { isAuthenticated, user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/login')
  }

  const avatarSrc =
    user?.avatar &&
    (user.avatar.startsWith('http') ? user.avatar : `${MEDIA_BASE}${user.avatar}`)

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {showBurger && (
          <button className="burger" onClick={onBurgerClick}>
            <Menu size={22} />
          </button>
        )}
        <Link to="/" className="navbar-brand">
          GAME<span className="brand-accent">MARKET</span>
        </Link>
      </div>

      <div className="navbar-right">
        {isAuthenticated ? (
          <div className="profile-menu" ref={menuRef}>
            <button className="profile-trigger" onClick={() => setOpen(!open)}>
              {avatarSrc ? (
                <img src={avatarSrc} alt="" className="profile-trigger-avatar" />
              ) : (
                <span className="profile-trigger-letter">
                  {user.username[0].toUpperCase()}
                </span>
              )}
              <span className="profile-trigger-name">{user.username}</span>
              <ChevronDown size={16} />
            </button>

            {open && (
              <div className="profile-dropdown">
                <Link to="/profile" onClick={() => setOpen(false)}>
                  <User size={16} />
                  Профиль
                </Link>
                <Link to="/my-accounts" onClick={() => setOpen(false)}>
                  <Tag size={16} />
                  Мои объявления
                </Link>
                <Link to="/orders" onClick={() => setOpen(false)}>
                  <Package size={16} />
                  Мои заказы
                </Link>
                <button onClick={handleLogout}>
                  <LogOut size={16} />
                  Выйти
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="navbar-auth">
            <Link to="/cart" className="navbar-cart">
              Корзина
              {count > 0 && <span className="cart-badge">{count}</span>}
            </Link>
            <Link to="/login">Вход</Link>
            <Link to="/register" className="navbar-register">
              Регистрация
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}