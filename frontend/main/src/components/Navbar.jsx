import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Button from './ui/Button'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/careers', label: 'Careers' },
  { to: '/contact', label: 'Contact Us' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const darkHeroPages = ['/about', '/careers', '/contact', '/become-delivery-partner', '/become-merchant']
  const isDarkHero = darkHeroPages.includes(location.pathname)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const textColor = scrolled ? 'text-navy' : (isDarkHero ? 'text-white' : 'text-navy')

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'glass border-b border-white/30 shadow-lg shadow-black/5'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo — company-logo.png */}
            <Link to="/" className="flex items-center group">
              <img
                src="/logos/company-logo.png"
                alt="NatooKart — India's Local Shopping App"
                className="h-16 sm:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `relative px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-primary hover:scale-[1.02] ${
                      isActive ? 'text-primary' : textColor
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {isActive && (
                        <motion.div
                          layoutId="nav-underline"
                          className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Link to="/become-merchant">
                <Button variant="ghost" size="sm">Become a Merchant</Button>
              </Link>
              <Link to="/become-delivery-partner">
                <Button variant="primary" size="sm">Delivery Partner</Button>
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`lg:hidden p-2 rounded-xl transition-colors ${textColor} hover:bg-primary/10`}
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-[60] lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white/95 backdrop-blur-xl z-[70] shadow-2xl lg:hidden"
            >
              <div className="flex flex-col h-full p-6">
                <div className="flex justify-between items-center mb-8">
                  <Link to="/" onClick={() => setMobileOpen(false)}>
                    <img src="/logos/company-logo.png" alt="NatooKart" className="h-14 w-auto object-contain" />
                  </Link>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-600"
                    aria-label="Close menu"
                  >
                    <X size={22} />
                  </button>
                </div>

                <div className="flex flex-col gap-1 flex-1">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <NavLink
                        to={link.to}
                        className={({ isActive }) =>
                          `block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                            isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50'
                          }`
                        }
                      >
                        {link.label}
                      </NavLink>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 pt-6 border-t border-gray-100">
                  <Link to="/become-merchant" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full">Become a Merchant</Button>
                  </Link>
                  <Link to="/become-delivery-partner" onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" className="w-full">Delivery Partner</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
