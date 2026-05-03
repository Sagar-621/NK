import React from 'react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorId: null }
  }

  static getDerivedStateFromError(error) {
    const errorId = 'ERR-' + Date.now().toString(36).toUpperCase()
    return { hasError: true, errorId }
  }

  componentDidCatch(error, errorInfo) {
    // TODO: Send error to monitoring service (Sentry, LogRocket, etc.)
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-primary-light p-6">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-navy">Something went wrong</h1>
            <p className="text-gray-500 mt-3 leading-relaxed">
              We encountered an unexpected error. Our team has been notified and is working on a fix.
            </p>
            <div className="bg-gray-100 rounded-xl px-4 py-2 mt-4 inline-block">
              <span className="text-xs font-mono text-gray-500">Error ID: {this.state.errorId}</span>
            </div>
            <div className="mt-8">
              <button
                onClick={() => {
                  this.setState({ hasError: false, errorId: null })
                  window.location.href = '/'
                }}
                className="inline-flex items-center px-8 py-3 bg-primary text-white font-semibold rounded-2xl btn-3d"
              >
                ← Go Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
