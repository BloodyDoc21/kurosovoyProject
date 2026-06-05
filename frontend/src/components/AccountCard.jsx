import { Link } from 'react-router-dom'
import { Gamepad2 } from 'lucide-react'
import { useCart } from '../contexts/CartContext'

export default function AccountCard({ account, index = 0 }) {
  const { addItem, removeItem, isInCart } = useCart()
  const inCart = isInCart(account.id)

  return (
    <div className="account-card" style={{ animationDelay: `${index * 0.05}s` }}>
      {account.game_cover ? (
        <img src={account.game_cover} alt={account.game_title} className="account-card-cover" />
      ) : (
        <div className="account-card-cover account-card-cover-empty">
          <Gamepad2 size={32} />
        </div>
      )}
      <div className="account-card-body">
        <Link to={`/accounts/${account.id}`} className="account-card-title">
          {account.title}
        </Link>
        <p className="account-card-game">{account.game_title}</p>
        <div className="account-card-meta">
          <span className="account-card-level">Ур. {account.level}</span>
          <span className="account-card-price">{account.price} ₽</span>
        </div>
        {inCart ? (
          <button className="btn-secondary" onClick={() => removeItem(account.id)}>
            Убрать из корзины
          </button>
        ) : (
          <button className="btn-primary" onClick={() => addItem(account)}>
            В корзину
          </button>
        )}
      </div>
    </div>
  )
}