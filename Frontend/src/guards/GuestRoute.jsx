import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext.jsx'

export default function GuestRoute() {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />
}
