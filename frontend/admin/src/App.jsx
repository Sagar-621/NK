import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Merchants from './pages/Merchants'
import DeliveryPartners from './pages/DeliveryPartners'
import Jobs from './pages/Jobs'
import JobApplications from './pages/JobApplications'
import ContactInquiries from './pages/ContactInquiries'
import Settings from './pages/Settings'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="merchants" element={<Merchants />} />
            <Route path="delivery-partners" element={<DeliveryPartners />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="job-applications" element={<JobApplications />} />
            <Route path="contact-inquiries" element={<ContactInquiries />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
