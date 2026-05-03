import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-primary-50 relative overflow-hidden">
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-100/30 rounded-full blur-[100px]" />
      <motion.div className="text-center px-4 relative z-10"
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}>
        <div className="text-[120px] sm:text-[180px] font-black text-primary/10 leading-none select-none">404</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-navy -mt-8 sm:-mt-12">Page not found</h1>
        <p className="text-gray-500 mt-4 max-w-md mx-auto">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="inline-block mt-8"><Button variant="primary" size="lg">← Back to Home</Button></Link>
      </motion.div>
    </section>
  )
}
