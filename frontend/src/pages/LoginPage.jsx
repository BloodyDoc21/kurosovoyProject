import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      setError('Заполните все поля.')
      return
    }
    setSubmitting(true)
    try {
      await login(form.username, form.password)
      navigate('/profile')
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Неверное имя пользователя или пароль.')
      } else {
        setError('Ошибка входа. Попробуйте позже.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-form">
      <h1>Вход</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Имя пользователя</label>
          <input
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Вход...' : 'Войти'}
        </button>
      </form>
      <p>
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </div>
  )
}