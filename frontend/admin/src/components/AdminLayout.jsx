import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu, Bell, Monitor } from 'lucide-react'
import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'

const pageTitles = {
  '/': 'Dashboard',
  '/merchants': 'Merchants',
  '/delivery-partners': 'Delivery Partners',
  '/jobs': 'Job Postings',
  '/contact-inquiries': 'Contact Inquiries',
  '/settings': 'Settings',
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const location = useLocation()
  const { user } = useAuth()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const title = pageTitles[location.pathname] || 'Admin'

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content */}
      <div className="lg:ml-16 xl:ml-64 transition-all duration-300">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl text-gray-600">
                <Menu size={20} />
              </button>
              <h1 className="text-lg font-bold text-navy">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile "optimized for desktop" banner */}
        {isMobile && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-amber-700 text-xs">
            <Monitor size={14} />
            <span>This panel is optimized for desktop. Some features may be limited on mobile.</span>
          </div>
        )}

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
