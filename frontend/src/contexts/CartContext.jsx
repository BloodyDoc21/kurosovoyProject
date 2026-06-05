import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export const useCart = () => useContext(CartContext)

const cartKey = (user) => (user ? `cart_${user.id}` : 'cart_guest')

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem(cartKey(user))
    setItems(stored ? JSON.parse(stored) : [])
  }, [user])

  useEffect(() => {
    localStorage.setItem(cartKey(user), JSON.stringify(items))
  }, [items, user])

  const addItem = (account) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === account.id)) {
        return prev
      }
      return [...prev, account]
    })
  }

  const removeItem = (accountId) => {
    setItems((prev) => prev.filter((i) => i.id !== accountId))
  }

  const clearCart = () => {
    setItems([])
  }

  const isInCart = (accountId) => items.some((i) => i.id === accountId)

  const total = items.reduce((sum, i) => sum + parseFloat(i.price), 0)

  const value = {
    items,
    count: items.length,
    total,
    addItem,
    removeItem,
    clearCart,
    isInCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}