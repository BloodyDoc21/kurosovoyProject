import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile/')
      setUser(response.data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const access = localStorage.getItem('access')
    if (access) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username, password) => {
    const response = await api.post('/auth/login/', { username, password })
    localStorage.setItem('access', response.data.access)
    localStorage.setItem('refresh', response.data.refresh)
    await fetchProfile()
  }

  const register = async (data) => {
    await api.post('/auth/register/', data)
  }

  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    setUser(null)
  }

  const updateProfile = async (data) => {
    const response = await api.patch('/auth/profile/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    setUser(response.data)
    return response.data
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}