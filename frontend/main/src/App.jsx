import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import MaintenanceBanner from './components/MaintenanceBanner'
import OfflineBanner from './components/OfflineBanner'
import ErrorBoundary from './components/ErrorBoundary'
import { MAINTENANCE_MODE } from './config/siteConfig'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Careers = lazy(() => import('./pages/Careers'))
const Contact = lazy(() => import('./pages/Contact'))
const BecomeMerchant = lazy(() => import('./pages/BecomeMerchant'))
const BecomeDeliveryPartner = lazy(() => import('./pages/BecomeDeliveryPartner'))
const NotFound = lazy(() => import('./pages/NotFound'))

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-medium">Loading...</p>
      </div>
    </div>
  )
}

export default function App() {
  // Full maintenance mode blocks everything
  if (MAINTENANCE_MODE === true) {
    return <MaintenanceBanner />
  }

  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <OfflineBanner />
        <MaintenanceBanner />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/become-merchant" element={<BecomeMerchant />} />
                <Route path="/become-delivery-partner" element={<BecomeDeliveryPartner />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </ErrorBoundary>
  )
}
