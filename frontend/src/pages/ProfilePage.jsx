import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

const MEDIA_BASE = 'http://127.0.0.1:8000'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
      })
    }
  }, [user])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: null })
    setSuccess(false)
  }

  const handleFileChange = (e) => {
    setAvatarFile(e.target.files[0])
    setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSuccess(false)
    setSubmitting(true)

    const data = new FormData()
    Object.keys(form).forEach((key) => data.append(key, form[key]))
    if (avatarFile) {
      data.append('avatar', avatarFile)
    }

    try {
      await updateProfile(data)
      setAvatarFile(null)
      setSuccess(true)
    } catch (err) {
      const resData = err.response?.data
      if (resData) {
        const fieldErrors = {}
        Object.keys(resData).forEach((key) => {
          fieldErrors[key] = Array.isArray(resData[key]) ? resData[key][0] : resData[key]
        })
        setErrors(fieldErrors)
      } else {
        setErrors({ general: 'Ошибка сохранения профиля.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) return <p>Загрузка...</p>

  return (
    <div className="profile-page">
      <h1>Личный кабинет</h1>

      <div className="profile-header">
        {user.avatar ? (
          <img
            src={user.avatar.startsWith('http') ? user.avatar : `${MEDIA_BASE}${user.avatar}`}
            alt="Аватар"
            className="profile-avatar"
          />
        ) : (
          <div className="profile-avatar profile-avatar-empty">
            {user.username[0].toUpperCase()}
          </div>
        )}
        <div>
          <p className="profile-username">{user.username}</p>
          {user.is_staff && <span className="profile-badge">Администратор</span>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="first_name">Имя</label>
          <input
            id="first_name"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="last_name">Фамилия</label>
          <input
            id="last_name"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
          />
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
          <label htmlFor="phone">Телефон</label>
          <input
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
          {errors.phone && <span className="field-error">{errors.phone}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="bio">О себе</label>
          <textarea
            id="bio"
            name="bio"
            rows="3"
            value={form.bio}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="avatar">Аватар</label>
          <input
            id="avatar"
            name="avatar"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        {errors.general && <p className="form-error">{errors.general}</p>}
        {success && <p className="form-success">Профиль обновлён.</p>}

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Сохранение...' : 'Сохранить'}
        </button>
      </form>
    </div>
  )
}