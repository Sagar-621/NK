import { useState, useEffect } from 'react'
import { MAINTENANCE_MODE, MAINTENANCE_END, MAINTENANCE_TITLE, MAINTENANCE_MESSAGE, PARTIAL_MAINTENANCE_MESSAGE } from '../config/siteConfig'
import { AlertTriangle, Clock, Wrench, X } from 'lucide-react'

function CountdownTimer({ target }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(target))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(target))
    }, 1000)
    return () => clearInterval(timer)
  }, [target])

  function getTimeLeft(targetDate) {
    const diff = new Date(targetDate) - new Date()
    if (diff <= 0) return { h: 0, m: 0, s: 0 }
    return {
      h: Math.floor(diff / (1000 * 60 * 60)),
      m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      s: Math.floor((diff % (1000 * 60)) / 1000),
    }
  }

  const pad = (n) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center gap-3 mt-6">
      {[
        { val: timeLeft.h, label: 'Hours' },
        { val: timeLeft.m, label: 'Minutes' },
        { val: timeLeft.s, label: 'Seconds' },
      ].map((unit, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[60px] text-center">
            <span className="text-3xl font-black text-white">{pad(unit.val)}</span>
          </div>
          <span className="text-xs text-white/60 mt-1.5">{unit.label}</span>
        </div>
      ))}
    </div>
  )
}

// Full-screen maintenance overlay
function FullMaintenance() {
  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-primary-dark to-navy flex items-center justify-center p-6">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Wrench size={40} className="text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{MAINTENANCE_TITLE}</h1>
        <p className="text-white/70 mt-4 leading-relaxed">{MAINTENANCE_MESSAGE}</p>
        <CountdownTimer target={MAINTENANCE_END} />
        <p className="text-white/40 text-sm mt-8">
          Need help? Contact us at <a href="mailto:hello@natookart.com" className="text-primary-200 underline">hello@natookart.com</a>
        </p>
      </div>
    </div>
  )
}

// Amber warning banner (non-blocking)
function PartialBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-navy">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <AlertTriangle size={16} />
          <span>{PARTIAL_MAINTENANCE_MESSAGE}</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-amber-600/30 rounded transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

export default function MaintenanceBanner() {
  if (MAINTENANCE_MODE === true) return <FullMaintenance />
  if (MAINTENANCE_MODE === 'partial') return <PartialBanner />
  return null
}
