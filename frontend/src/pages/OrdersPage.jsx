import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const STATUS_LABELS = {
  new: 'Новый',
  processing: 'В обработке',
  completed: 'Завершён',
  cancelled: 'Отменён',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await api.get('/orders/')
        setOrders(res.data.results || res.data)
      } catch {
        setError('Не удалось загрузить заказы.')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) return <p>Загрузка...</p>
  if (error) return <p className="form-error">{error}</p>

  return (
    <div className="orders-page">
      <h1>Мои заказы</h1>

      {orders.length === 0 ? (
        <p className="catalog-empty">У вас пока нет заказов.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-head">
                <span className="order-id">Заказ #{order.id}</span>
                <span className={`order-status status-${order.status}`}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
              <p className="order-date">{formatDate(order.created_at)}</p>

              <div className="order-items">
                {order.items.map((item) => (
                  <div key={item.id} className="order-item">
                    <Link to={`/accounts/${item.account}`} className="order-item-title">
                      {item.account_title}
                    </Link>
                    <span>{item.price_at_purchase} ₽</span>
                  </div>
                ))}
              </div>

              <div className="order-total">
                Итого: <strong>{order.total_price} ₽</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}