import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

export default function AccountDetailPage() {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuth()
  const { addItem, removeItem, isInCart } = useCart()

  const [hasPurchased, setHasPurchased] = useState(false)

  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchAccount = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/accounts/${id}/`)
      setAccount(res.data)
    } catch {
      setError('Не удалось загрузить аккаунт.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccount()
  }, [id])

  useEffect(() => {
    if (!isAuthenticated) {
      setHasPurchased(false)
      return
    }
    api
      .get('/orders/')
      .then((res) => {
        const orders = res.data.results || res.data
        const bought = orders.some((order) =>
          order.items?.some((item) => item.account === Number(id))
        )
        setHasPurchased(bought)
      })
      .catch(() => setHasPurchased(false))
  }, [id, isAuthenticated])

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setReviewError('')
    if (!text.trim()) {
      setReviewError('Введите текст отзыва.')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/reviews/', {
        account: Number(id),
        rating: Number(rating),
        text,
      })
      setText('')
      setRating(5)
      await fetchAccount()
    } catch (err) {
      const data = err.response?.data
      if (data?.non_field_errors) {
        setReviewError(data.non_field_errors[0])
      } else if (data) {
        const first = Object.values(data)[0]
        setReviewError(Array.isArray(first) ? first[0] : String(first))
      } else {
        setReviewError('Ошибка отправки отзыва.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p>Загрузка...</p>
  if (error) return <p className="form-error">{error}</p>
  if (!account) return null

  const inCart = isInCart(account.id)
  const alreadyReviewed = account.reviews?.some((r) => r.author === user?.username)

  return (
    <div className="account-detail">
      <Link to="/" className="back-link">
        ← Назад в каталог
      </Link>

      <h1>{account.title}</h1>
      <p className="detail-game">Игра: {account.game_title}</p>

      <div className="detail-info">
        <span>Уровень: {account.level}</span>
        <span className="detail-price">{account.price} ₽</span>
        <span>Продавец: {account.seller || 'не указан'}</span>
      </div>

      <p className="detail-description">{account.description}</p>

      {inCart ? (
        <button className="btn-secondary" onClick={() => removeItem(account.id)}>
          Убрать из корзины
        </button>
      ) : (
        <button className="btn-primary" onClick={() => addItem(account)}>
          В корзину
        </button>
      )}

      <section className="reviews">
        <h2>Отзывы ({account.reviews?.length || 0})</h2>

        {account.reviews?.length === 0 && (
          <p className="reviews-empty">Отзывов пока нет.</p>
        )}

        {account.reviews?.map((review) => (
          <div key={review.id} className="review-item">
            <div className="review-head">
              <strong>{review.author}</strong>
              <span className="review-rating">{'★'.repeat(review.rating)}</span>
            </div>
            <p>{review.text}</p>
          </div>
        ))}

        {isAuthenticated && hasPurchased && !alreadyReviewed && (
          <form className="review-form" onSubmit={handleSubmitReview}>
            <h3>Оставить отзыв</h3>
            <div className="form-group">
              <label htmlFor="rating">Оценка</label>
              <select
                id="rating"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="text">Текст отзыва</label>
              <textarea
                id="text"
                rows="3"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            {reviewError && <p className="form-error">{reviewError}</p>}
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Отправка...' : 'Отправить отзыв'}
            </button>
          </form>
        )}

        {isAuthenticated && alreadyReviewed && (
          <p className="reviews-note">Вы уже оставили отзыв на этот аккаунт.</p>
        )}

        {isAuthenticated && !hasPurchased && !alreadyReviewed && (
          <p className="reviews-note">
            Оставить отзыв можно только после покупки этого аккаунта.
          </p>
        )}

        {!isAuthenticated && (
          <p className="reviews-note">
            <Link to="/login">Войдите</Link>, чтобы оставить отзыв.
          </p>
        )}
      </section>
    </div>
  )
}