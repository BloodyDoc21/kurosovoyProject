import { Link } from 'react-router-dom'
import { Mail, Send, Globe, Gamepad2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Footer() {
  const { isAuthenticated } = useAuth()
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-inner footer-inner-3">
        <div className="footer-col footer-brand-col">
          <div className="footer-brand">
            <Gamepad2 size={22} />
            <span>
              GAME<span className="brand-accent">MARKET</span>
            </span>
          </div>
          <p className="footer-desc">
            Маркетплейс для быстрой и безопасной покупки и продажи игровых аккаунтов.
          </p>
        </div>

        <div className="footer-col">
          <p className="footer-title">Навигация</p>
          <Link to="/">Каталог</Link>
          <Link to="/cart">Корзина</Link>
          {isAuthenticated ? (
            <>
              <Link to="/orders">Мои заказы</Link>
              <Link to="/my-accounts">Мои объявления</Link>
            </>
          ) : (
            <>
              <Link to="/login">Вход</Link>
              <Link to="/register">Регистрация</Link>
            </>
          )}
        </div>

        <div className="footer-col">
          <p className="footer-title">Контакты</p>
          <a href="mailto:support@gamemarket.ru">
            <Mail size={15} />
            support@gamemarket.ru
          </a>
          <a href="https://t.me" target="_blank" rel="noreferrer">
            <Send size={15} />
            Telegram
          </a>
          <a href="https://github.com" target="_blank" rel="noreferrer">
            <Globe size={15} />
            GitHub
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {year} GameMarket. Учебный проект.</span>
        <span>Создано на Django REST Framework + React</span>
      </div>
    </footer>
  )
}