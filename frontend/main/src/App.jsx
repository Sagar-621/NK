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
    <div className="min-h-screen bg-white">
      {/* Skeleton Navbar */}
      <div className="h-20 border-b border-gray-100 flex items-center px-8">
        <div className="w-32 h-8 bg-gray-100 rounded-xl animate-pulse" />
        <div className="ml-auto flex gap-6">
          {[1,2,3,4].map(i => <div key={i} className="w-16 h-4 bg-gray-50 rounded-md animate-pulse" />)}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        {/* Skeleton Hero */}
        <div className="max-w-2xl space-y-6">
          <div className="w-24 h-6 bg-secondary/10 rounded-full animate-pulse" />
          <div className="space-y-3">
            <div className="w-full h-12 bg-gray-100 rounded-2xl animate-pulse" />
            <div className="w-3/4 h-12 bg-gray-100 rounded-2xl animate-pulse" />
          </div>
          <div className="w-full h-20 bg-gray-50 rounded-2xl animate-pulse" />
          <div className="flex gap-4">
            <div className="w-36 h-12 bg-navy/10 rounded-xl animate-pulse" />
            <div className="w-36 h-12 bg-navy/10 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => (
            <div key={i} className="space-y-4">
              <div className="w-full h-48 bg-gray-100 rounded-3xl animate-pulse" />
              <div className="w-40 h-6 bg-gray-100 rounded-lg animate-pulse" />
              <div className="w-full h-4 bg-gray-50 rounded-md animate-pulse" />
              <div className="w-2/3 h-4 bg-gray-50 rounded-md animate-pulse" />
            </div>
          ))}
        </div>
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
