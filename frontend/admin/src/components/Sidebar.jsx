import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Store, Bike, Briefcase, MessageSquare, Settings, LogOut, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/merchants', icon: Store, label: 'Merchants' },
  { to: '/delivery-partners', icon: Bike, label: 'Delivery Partners' },
  { to: '/jobs', icon: Briefcase, label: 'Job Postings' },
  { to: '/contact-inquiries', icon: MessageSquare, label: 'Inquiries' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth()

  const sidebarContent = (
    <div className="flex flex-col h-full bg-navy text-white">
      {/* Logo */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center">
          {/* Collapsed: n-logo icon only */}
          <img src="/logos/n-logo.png" alt="NatooKart" className="w-9 h-9 rounded-lg object-cover flex-shrink-0 xl:hidden" />
          {/* Expanded: full company logo on white bg */}
          <div className="bg-white rounded-xl px-3 py-1.5 hidden xl:block">
            <img src="/logos/company-logo.png" alt="NatooKart" className="h-10 w-auto object-contain" />
          </div>
        </div>
        <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1 hover:bg-white/10 rounded-lg">
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-secondary text-white shadow-lg shadow-secondary/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <item.icon size={20} className="flex-shrink-0" />
            <span className="lg:block hidden xl:block">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-secondary/30 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="lg:block hidden xl:block min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.role || 'admin'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span className="lg:block hidden xl:block">Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-16 xl:w-64 z-30 transition-all duration-300">
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 z-50 lg:hidden shadow-2xl">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  )
}
