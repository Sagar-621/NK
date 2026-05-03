import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 30 // seconds

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [lockoutEnd, setLockoutEnd] = useState(null)
  const [lockoutSeconds, setLockoutSeconds] = useState(0)
  const [shake, setShake] = useState(false)

  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated])

  // Show logout reason toast
  useEffect(() => {
    const reason = sessionStorage.getItem('logout_reason')
    if (reason) {
      setError(typeof reason === 'string' ? reason : String(reason))
      sessionStorage.removeItem('logout_reason')
    }
  }, [])

  // Lockout countdown
  useEffect(() => {
    if (!lockoutEnd) return
    const timer = setInterval(() => {
      const remaining = Math.ceil((lockoutEnd - Date.now()) / 1000)
      if (remaining <= 0) {
        setLockoutEnd(null)
        setLockoutSeconds(0)
        setError('')
      } else {
        setLockoutSeconds(remaining)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [lockoutEnd])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (lockoutEnd && Date.now() < lockoutEnd) return

    // TODO: Replace with real API call + reCAPTCHA v3
    const result = login(email, password)

    if (result.success) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setShake(true)
      setTimeout(() => setShake(false), 500)

      if (newAttempts >= MAX_ATTEMPTS) {
        setError('Too many failed attempts. Please reload the page.')
        setLockoutEnd(Infinity) // permanent lock until reload
        // TODO: Add server-side rate limiting with express-rate-limit
      } else if (newAttempts >= 3) {
        const end = Date.now() + LOCKOUT_DURATION * 1000
        setLockoutEnd(end)
        setLockoutSeconds(LOCKOUT_DURATION)
        setError(`Too many attempts. Please wait ${LOCKOUT_DURATION}s.`)
      } else {
        setError(result.message || 'Invalid credentials')
      }
    }
  }

  const isLocked = lockoutEnd && Date.now() < lockoutEnd

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/logos/company-logo.png"
            alt="NatooKart"
            className="h-28 w-auto object-contain mx-auto mb-2"
          />
          <h1 className="text-2xl font-bold text-navy">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to NatooKart Admin Panel</p>
        </div>

        {/* Card */}
        <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 p-8 ${shake ? 'animate-shake' : ''}`}>
          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <p>{error}</p>
                {lockoutSeconds > 0 && lockoutEnd !== Infinity && (
                  <p className="font-bold mt-1">Retry in {lockoutSeconds}s</p>
                )}
              </div>
            </div>
          )}

          {/* Attempt counter */}
          {attempts > 0 && attempts < MAX_ATTEMPTS && !isLocked && (
            <div className="mb-4 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              {attempts} of {MAX_ATTEMPTS} attempts used
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 focus:border-primary rounded-xl transition-colors outline-none text-sm"
                  placeholder="admin@groceryapp.com"
                  disabled={isLocked}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-100 focus:border-primary rounded-xl transition-colors outline-none text-sm"
                  placeholder="••••••••"
                  disabled={isLocked}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLocked}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                isLocked
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40'
              }`}
            >
              {isLocked && lockoutEnd !== Infinity
                ? `Locked (${lockoutSeconds}s)`
                : isLocked
                ? 'Account Locked — Reload Page'
                : 'Sign In'}
            </button>
          </form>

          {/* Hint removed for security */}
        </div>
      </div>
    </div>
  )
}
