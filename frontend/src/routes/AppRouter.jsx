import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import CatalogPage from '../pages/CatalogPage'
import AccountDetailPage from '../pages/AccountDetailPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import CartPage from '../pages/CartPage'
import OrdersPage from '../pages/OrdersPage'
import ProfilePage from '../pages/ProfilePage'
import MyAccountsPage from '../pages/MyAccountsPage'
import AccountFormPage from '../pages/AccountFormPage'
import NotFoundPage from '../pages/NotFoundPage'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/accounts/:id" element={<AccountDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-accounts"
        element={
          <ProtectedRoute>
            <MyAccountsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-accounts/new"
        element={
          <ProtectedRoute>
            <AccountFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-accounts/:id/edit"
        element={
          <ProtectedRoute>
            <AccountFormPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}