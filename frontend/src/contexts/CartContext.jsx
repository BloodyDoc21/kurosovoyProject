import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export const useCart = () => useContext(CartContext)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem('cart')
    return stored ? JSON.parse(stored) : []
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

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