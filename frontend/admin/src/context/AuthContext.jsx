import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../api'

const AuthContext = createContext(null)

const SESSION_TIMEOUT   = 30 * 60 * 1000 // 30 minutes
const TAB_HIDDEN_TIMEOUT = 15 * 60 * 1000 // 15 minutes

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('admin_session')
    if (stored) {
      try {
        const session = JSON.parse(stored)
        if (session.expiresAt && new Date(session.expiresAt) > new Date()) {
          setUser(session)
        } else {
          localStorage.removeItem('admin_session')
        }
      } catch {
        localStorage.removeItem('admin_session')
      }
    }
    setIsLoading(false)
  }, [])

  // Session timeout — auto logout after inactivity
  useEffect(() => {
    if (!user) return
    let timeout
    const resetTimeout = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => logout('Session expired due to inactivity'), SESSION_TIMEOUT)
    }
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, resetTimeout, { passive: true }))
    resetTimeout()
    return () => {
      clearTimeout(timeout)
      events.forEach(e => window.removeEventListener(e, resetTimeout))
    }
  }, [user])

  // Tab hidden — auto logout if hidden > 15 min
  useEffect(() => {
    if (!user) return
    let hiddenAt = null
    const handleVisibility = () => {
      if (document.hidden) {
        hiddenAt = Date.now()
      } else if (hiddenAt && Date.now() - hiddenAt > TAB_HIDDEN_TIMEOUT) {
        logout('Session expired — tab was inactive')
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [user])

  const login = useCallback(async (email, password) => {
    try {
      const data = await api.login(email, password) // Returns { token, user: { id, name, ... } }
      const session = {
        token: data.token,
        ...data.user,
        expiresAt: new Date(Date.now() + SESSION_TIMEOUT).toISOString(),
      }
      localStorage.setItem('admin_session', JSON.stringify(session))
      setUser(session)
      return { success: true }
    } catch (err) {
      return { success: false, message: err.message || 'Invalid email or password' }
    }
  }, [])

  const logout = useCallback((reason = '') => {
    localStorage.removeItem('admin_session')
    setUser(null)
    if (reason) sessionStorage.setItem('logout_reason', reason)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
