import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function MyAccountsPage() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchMyAccounts = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/accounts/', { params: { mine: 'true', page_size: 100 } })
      setAccounts(res.data.results || res.data)
    } catch {
      setError('Не удалось загрузить объявления.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchMyAccounts()
  }, [user])

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить это объявление?')) return
    try {
      await api.delete(`/accounts/${id}/`)
      setAccounts((prev) => prev.filter((a) => a.id !== id))
    } catch {
      setError('Не удалось удалить объявление.')
    }
  }

  if (loading) return <p>Загрузка...</p>

  return (
    <div className="my-accounts">
      <div className="my-accounts-head">
        <h1>Мои объявления</h1>
        <Link to="/my-accounts/new" className="btn-primary">
          Создать объявление
        </Link>
      </div>

      {error && <p className="form-error">{error}</p>}

      {accounts.length === 0 ? (
        <p className="catalog-empty">У вас пока нет объявлений.</p>
      ) : (
        <div className="my-accounts-list">
          {accounts.map((account) => (
            <div key={account.id} className="my-account-item">
              <div>
                <Link to={`/accounts/${account.id}`} className="my-account-title">
                  {account.title}
                </Link>
                <p className="my-account-meta">
                  {account.game_title} · {account.price} ₽ ·{' '}
                  {account.is_published ? 'опубликовано' : 'скрыто'}
                </p>
              </div>
              <div className="my-account-actions">
                <Link to={`/my-accounts/${account.id}/edit`} className="btn-secondary">
                  Изменить
                </Link>
                <button className="btn-danger" onClick={() => handleDelete(account.id)}>
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}