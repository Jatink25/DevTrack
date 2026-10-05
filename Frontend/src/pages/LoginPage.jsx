import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { getErrorMessage } from '../lib/getErrorMessage.js'

// Messages for the status codes authController can return on login.
const loginErrors = {
  400: 'Invalid email or password.',
  404: 'No account found with this email. Register first.',
}

export default function LoginPage() {
  const { login } = useAuth()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // On success the user is set in AuthContext and GuestRoute redirects to /dashboard.
      await login(form)
    } catch (err) {
      setError(getErrorMessage(err, loginErrors))
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white border border-gray-200 rounded-lg p-6 space-y-4"
      >
        <h1 className="text-xl font-semibold text-gray-900">Log in to DevTrack</h1>

        {location.state?.registered && (
          <p className="text-sm text-green-700">Account created. Log in to continue.</p>
        )}
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="email" className="block text-sm text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer bg-gray-900 text-white rounded py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        <p className="text-sm text-gray-600">
          No account yet?{' '}
          <Link to="/register" className="cursor-pointer text-gray-900 underline">
            Create one
          </Link>
        </p>
      </form>
    </main>
  )
}
