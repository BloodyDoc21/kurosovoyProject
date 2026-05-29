import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'

export default function CartPage() {
  const { items, total, removeItem, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (items.length === 0) {
      setError('Корзина пуста')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const account_ids = items.map((i) => i.id)
      await api.post('/orders/', { account_ids })
      clearCart()
      setSuccess(true)
    } catch (err) {
      const data = err.response?.data
      if (data?.account_ids) {
        setError(Array.isArray(data.account_ids) ? data.account_ids[0] : data.account_ids)
      } else {
        setError('Ошибка при оформлении заказа. Попробуйте позже.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="cart-success">
        <h1>Заказ оформлен</h1>
        <p>Ваш заказ успешно создан.</p>
        <div className="cart-success-actions">
          <Link to="/orders" className="btn-primary">
            Мои заказы
          </Link>
          <Link to="/" className="btn-secondary">
            В каталог
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <h1>Корзина</h1>

      {items.length === 0 ? (
        <p className="catalog-empty">Корзина пуста</p>
      ) : (
        <>
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <div>
                  <Link to={`/accounts/${item.id}`} className="cart-item-title">
                    {item.title}
                  </Link>
                  <p className="cart-item-game">{item.game_title}</p>
                </div>
                <div className="cart-item-right">
                  <span className="cart-item-price">{item.price} ₽</span>
                  <button className="btn-secondary" onClick={() => removeItem(item.id)}>
                    Убрать
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <span>Итого: {total.toFixed(2)} ₽</span>
            <span className="cart-count">Товаров: {items.length}</span>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            className="btn-primary cart-checkout"
            onClick={handleCheckout}
            disabled={submitting}
          >
            {submitting ? 'Оформление...' : 'Оформить заказ'}
          </button>

          {!isAuthenticated && (
            <p className="reviews-note">
              Для оформления заказа нужно <Link to="/login">войти</Link>.
            </p>
          )}
        </>
      )}
    </div>
  )
}