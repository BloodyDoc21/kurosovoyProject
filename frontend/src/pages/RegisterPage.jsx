import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: null })
  }

  const validate = () => {
    const newErrors = {}
    if (!form.username) newErrors.username = 'Введите имя пользователя.'
    if (!form.email) {
      newErrors.email = 'Введите email.'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Некорректный email.'
    }
    if (!form.password) newErrors.password = 'Введите пароль.'
    else if (form.password.length < 8)
      newErrors.password = 'Пароль должен быть не короче 8 символов.'
    if (form.password !== form.password2)
      newErrors.password2 = 'Пароли не совпадают.'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setSubmitting(true)
    try {
      await register(form)
      navigate('/login')
    } catch (err) {
      const data = err.response?.data
      if (data) {
        const serverErrors = {}
        Object.keys(data).forEach((key) => {
          serverErrors[key] = Array.isArray(data[key]) ? data[key][0] : data[key]
        })
        setErrors(serverErrors)
      } else {
        setErrors({ general: 'Ошибка регистрации. Попробуйте позже.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-form">
      <h1>Регистрация</h1>
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
          {errors.username && <span className="field-error">{errors.username}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
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
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="password2">Повторите пароль</label>
          <input
            id="password2"
            name="password2"
            type="password"
            value={form.password2}
            onChange={handleChange}
          />
          {errors.password2 && <span className="field-error">{errors.password2}</span>}
        </div>
        {errors.general && <p className="form-error">{errors.general}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
      <p>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  )
}