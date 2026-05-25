import { useState, useEffect } from 'react'
import api from '../services/api'
import AccountCard from '../components/AccountCard'

export default function CatalogPage() {
  const [accounts, setAccounts] = useState([])
  const [games, setGames] = useState([])
  const [search, setSearch] = useState('')
  const [selectedGame, setSelectedGame] = useState('')
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const PAGE_SIZE = 10

  useEffect(() => {
    api
      .get('/games/')
      .then((res) => setGames(res.data.results || res.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true)
      setError('')
      try {
        const params = { page }
        if (search) params.search = search
        if (selectedGame) params.game = selectedGame
        const res = await api.get('/accounts/', { params })
        setAccounts(res.data.results)
        setCount(res.data.count)
      } catch {
        setError('Ошибка загрузки каталога. Проверьте соединение.')
      } finally {
        setLoading(false)
      }
    }
    fetchAccounts()
  }, [page, search, selectedGame])

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleGameChange = (e) => {
    setSelectedGame(e.target.value)
    setPage(1)
  }

  const totalPages = Math.ceil(count / PAGE_SIZE)

  return (
    <div>
      <h1>Каталог игровых аккаунтов</h1>

      <div className="catalog-filters">
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={search}
          onChange={handleSearchChange}
        />
        <select value={selectedGame} onChange={handleGameChange}>
          <option value="">Все игры</option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Загрузка...</p>}
      {error && <p className="form-error">{error}</p>}

      {!loading && !error && accounts.length === 0 && (
        <p className="catalog-empty">Каталог пуст</p>
      )}

      <div className="account-grid">
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Назад
          </button>
          <span>
            Страница {page} из {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Вперёд
          </button>
        </div>
      )}
    </div>
  )
}