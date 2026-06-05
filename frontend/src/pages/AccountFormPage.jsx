import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function AccountFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [games, setGames] = useState([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    level: 1,
    game: '',
    is_published: true,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api
      .get('/games/')
      .then((res) => setGames(res.data.results || res.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit) return
    api
      .get(`/accounts/${id}/`)
      .then((res) => {
        const a = res.data
        setForm({
          title: a.title,
          description: a.description,
          price: a.price,
          level: a.level,
          game: a.game,
          is_published: a.is_published,
        })
      })
      .catch(() => setErrors({ general: 'Не удалось загрузить объявление.' }))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
    setErrors({ ...errors, [name]: null })
  }

  const validate = () => {
    const newErrors = {}
    if (!form.title.trim()) newErrors.title = 'Введите заголовок.'
    if (!form.description.trim()) newErrors.description = 'Введите описание.'
    if (!form.price || Number(form.price) <= 0) newErrors.price = 'Укажите корректную цену.'
    if (!form.game) newErrors.game = 'Выберите игру.'
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
      const payload = {
        title: form.title,
        description: form.description,
        price: form.price,
        level: Number(form.level),
        game: Number(form.game),
        is_published: form.is_published,
      }
      if (isEdit) {
        await api.patch(`/accounts/${id}/`, payload)
      } else {
        await api.post('/accounts/', payload)
      }
      navigate('/my-accounts')
    } catch (err) {
      const data = err.response?.data
      if (data) {
        const fieldErrors = {}
        Object.keys(data).forEach((key) => {
          fieldErrors[key] = Array.isArray(data[key]) ? data[key][0] : data[key]
        })
        setErrors(fieldErrors)
      } else {
        setErrors({ general: 'Ошибка сохранения.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p>Загрузка...</p>

  return (
    <div className="auth-form">
      <h1>{isEdit ? 'Редактирование объявления' : 'Новое объявление'}</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Заголовок</label>
          <input id="title" name="title" value={form.title} onChange={handleChange} />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="game">Игра</label>
          <select id="game" name="game" value={form.game} onChange={handleChange}>
            <option value="">Выберите игру</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
          {errors.game && <span className="field-error">{errors.game}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="description">Описание</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={form.description}
            onChange={handleChange}
          />
          {errors.description && <span className="field-error">{errors.description}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="price">Цена (₽)</label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            value={form.price}
            onChange={handleChange}
          />
          {errors.price && <span className="field-error">{errors.price}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="level">Уровень</label>
          <input
            id="level"
            name="level"
            type="number"
            min="1"
            value={form.level}
            onChange={handleChange}
          />
        </div>
        <div className="form-group form-checkbox">
          <input
            id="is_published"
            name="is_published"
            type="checkbox"
            checked={form.is_published}
            onChange={handleChange}
          />
          <label htmlFor="is_published">Опубликовать в каталоге</label>
        </div>

        {errors.general && <p className="form-error">{errors.general}</p>}

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
        </button>
      </form>
    </div>
  )
}