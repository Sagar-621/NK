import { useState, useEffect } from 'react'
import { WifiOff, X } from 'lucide-react'

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handleOffline = () => { setIsOffline(true); setDismissed(false) }
    const handleOnline = () => setIsOffline(false)

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (!isOffline || dismissed) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] bg-red-600 text-white animate-slideDown">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <WifiOff size={16} />
          <span>You're offline. Check your internet connection.</span>
        </div>
        <button onClick={() => setDismissed(true)} className="p-1 hover:bg-red-700 rounded" aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
