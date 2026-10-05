import { createContext, useContext, useEffect, useState } from 'react'
import api from '../../api/axios.js'
import { loginUser, registerUser } from './auth.api.js'

// Only the user object is stored here, never the JWTs (those stay in httpOnly cookies).
const STORAGE_KEY = 'devtrack_user'

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeStoredUser(user) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } catch {
    // storage unavailable: the user just won't survive a reload
  }
}

function removeStoredUser() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  // Any 401 from the backend means the cookie session is gone: clear the stored user.
  // Attached from here so api/axios.js stays unchanged.
  useEffect(() => {
    const id = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          setUser(null)
          removeStoredUser()
        }
        return Promise.reject(error)
      }
    )
    return () => api.interceptors.response.eject(id)
  }, [])

  const register = async (data) => {
    const res = await registerUser(data)
    return res.data.data
  }

  const login = async (data) => {
    const res = await loginUser(data)
    const loggedInUser = res.data.data
    setUser(loggedInUser)
    writeStoredUser(loggedInUser)
    return loggedInUser
  }

  // No logout endpoint exists, so this only clears frontend state.
  const logout = () => {
    setUser(null)
    removeStoredUser()
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
