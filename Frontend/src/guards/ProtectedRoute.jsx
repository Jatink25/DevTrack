import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext.jsx'

// The user is read synchronously from localStorage in AuthProvider,
// so there is no loading state to wait for.
export default function ProtectedRoute() {
  const { user } = useAuth()
  return user ? <Outlet /> : <Navigate to="/login" replace />
}
