import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Игровые аккаунты
      </Link>
      <div className="navbar-links">
        <Link to="/">Каталог</Link>
        <Link to="/cart">Корзина ({count})</Link>
        {isAuthenticated ? (
          <>
            <Link to="/orders">Мои заказы</Link>
            <Link to="/profile">{user?.username}</Link>
            <button onClick={handleLogout}>Выйти</button>
          </>
        ) : (
          <>
            <Link to="/login">Вход</Link>
            <Link to="/register">Регистрация</Link>
          </>
        )}
      </div>
    </nav>
  )
}