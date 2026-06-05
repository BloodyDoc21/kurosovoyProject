import { useState, useEffect } from 'react'
import api from '../services/api'

const STATUS_LABELS = {
  new: 'Новый',
  processing: 'В обработке',
  completed: 'Завершён',
  cancelled: 'Отменён',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [reviewedAccounts, setReviewedAccounts] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [activeForm, setActiveForm] = useState(null)
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const ordersRes = await api.get('/orders/')
      const ordersData = ordersRes.data.results || ordersRes.data
      setOrders(ordersData)

      const accountIds = new Set()
      ordersData.forEach((order) => {
        order.items.forEach((item) => accountIds.add(item.account))
      })

      const reviewed = new Set()
      await Promise.all(
        [...accountIds].map(async (accId) => {
          const res = await api.get('/reviews/', { params: { account: accId } })
          const reviews = res.data.results || res.data
          if (reviews.some((r) => r.is_mine)) {
            reviewed.add(accId)
          }
        })
      )
      setReviewedAccounts(reviewed)
    } catch {
      setError('Не удалось загрузить заказы.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openForm = (accountId) => {
    setActiveForm(accountId)
    setRating(5)
    setText('')
    setFormError('')
  }

  const closeForm = () => {
    setActiveForm(null)
    setFormError('')
  }

  const handleSubmitReview = async (e, accountId) => {
    e.preventDefault()
    setFormError('')
    if (!text.trim()) {
      setFormError('Введите текст отзыва.')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/reviews/', {
        account: accountId,
        rating: Number(rating),
        text,
      })
      setReviewedAccounts((prev) => new Set(prev).add(accountId))
      closeForm()
    } catch (err) {
      const data = err.response?.data
      if (data?.non_field_errors) {
        setFormError(data.non_field_errors[0])
      } else if (data) {
        const first = Object.values(data)[0]
        setFormError(Array.isArray(first) ? first[0] : String(first))
      } else {
        setFormError('Ошибка отправки отзыва.')
      }
    } finally {
      setSubmitting(false)
    }
  }

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
                  <div key={item.id} className="order-item-block">
                    <div className="order-item">
                      <span className="order-item-title">{item.account_title}</span>
                      <span>{item.price_at_purchase} ₽</span>
                    </div>

                    {reviewedAccounts.has(item.account) ? (
                      <span className="review-done">Отзыв оставлен</span>
                    ) : activeForm === item.account ? (
                      <form
                        className="order-review-form"
                        onSubmit={(e) => handleSubmitReview(e, item.account)}
                      >
                        <div className="order-review-row">
                          <select
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                          >
                            {[1, 2, 3, 4, 5].map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                          <textarea
                            rows="2"
                            placeholder="Ваш отзыв..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                          />
                        </div>
                        {formError && <p className="field-error">{formError}</p>}
                        <div className="order-review-actions">
                          <button
                            type="submit"
                            className="btn-primary"
                            disabled={submitting}
                          >
                            {submitting ? 'Отправка...' : 'Отправить'}
                          </button>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={closeForm}
                          >
                            Отмена
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        className="btn-secondary review-btn"
                        onClick={() => openForm(item.account)}
                      >
                        Оставить отзыв
                      </button>
                    )}
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