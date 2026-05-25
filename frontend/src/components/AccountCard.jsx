import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'

export default function AccountCard({ account }) {
  const { addItem, removeItem, isInCart } = useCart()
  const inCart = isInCart(account.id)

  return (
    <div className="account-card">
      <Link to={`/accounts/${account.id}`} className="account-card-title">
        {account.title}
      </Link>
      <p className="account-card-game">{account.game_title}</p>
      <div className="account-card-meta">
        <span>Уровень: {account.level}</span>
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
  )
}