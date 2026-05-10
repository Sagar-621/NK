import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import Button from '../components/ui/Button'
import { SubmittingSkeleton } from '../components/ui/Skeleton'

const fadeInUp = { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] } }
const childFade = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } }

const contactInfo = [
  { icon: MapPin, label: 'Visit Us', value: '123 Commerce Street, Tech Hub, Bangalore 560001', color: 'bg-secondary/10 text-secondary' },
  { icon: Phone, label: 'Call Us', value: '+91 98765 43210', color: 'bg-primary/10 text-primary' },
  { icon: Mail, label: 'Email Us', value: 'hello@natookart.com', color: 'bg-purple-50 text-purple-600' },
  { icon: Clock, label: 'Working Hours', value: 'Mon–Sat, 9:00 AM – 8:00 PM IST', color: 'bg-orange-50 text-orange-600' },
]

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '', _honey: '' })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Honeypot — silently reject bots
    if (formData._honey) { setSubmitted(true); return }
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/contact-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          subject: formData.subject,
          message: formData.message,
          is_bot: formData._honey ? 1 : 0,
        }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 4000)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '', _honey: '' })
    } catch (err) {
      console.error('Contact form error:', err)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-secondary-dark text-white pt-32 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div className="max-w-2xl" {...fadeInUp}>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Contact Us</h1>
            <p className="text-lg text-white/80 mt-6 leading-relaxed">Have a question, feedback, or partnership inquiry? We'd love to hear from you.</p>
          </motion.div>
        </div>
        <div className="wave-divider"><svg viewBox="0 0 1440 60" preserveAspectRatio="none"><path d="M0,0 C480,60 960,60 1440,0 L1440,60 L0,60 Z" fill="white" /></svg></div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
            variants={{ whileInView: { transition: { staggerChildren: 0.08 } } }}
            initial="initial" whileInView="whileInView" viewport={{ once: true, amount: 0.2 }}>
            {contactInfo.map((info, i) => (
              <motion.div key={i} variants={childFade}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:translate-y-[-4px] hover:shadow-xl transition-all duration-300 text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${info.color}`}>
                  <info.icon size={24} />
                </div>
                <h3 className="text-sm font-semibold text-navy">{info.label}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{info.value}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <motion.div className="text-center mb-12" {...fadeInUp}>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-navy">Send us a message</h2>
              <div className="w-16 h-1 bg-secondary rounded-full mx-auto mt-4" />
            </motion.div>

            <motion.div className="bg-white rounded-3xl shadow-contact p-8 sm:p-10" {...fadeInUp}>
              {isSubmitting ? (
                <SubmittingSkeleton label="Sending your message..." />
              ) : submitted ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send size={32} className="text-secondary" />
                  </div>
                  <h3 className="text-2xl font-bold text-navy">Thank you!</h3>
                  <p className="text-gray-500 mt-3 max-w-sm mx-auto">Your message has been sent. We'll get back within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <input type="text" name="_honey" value={formData._honey} onChange={(e) => setFormData({...formData, _honey: e.target.value})} style={{display:'none'}} tabIndex={-1} autoComplete="off" />
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3.5 border-2 border-gray-100 focus:border-primary rounded-xl transition-colors outline-none bg-gray-50/50" placeholder="John Doe" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Email *</label><input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3.5 border-2 border-gray-100 focus:border-primary rounded-xl transition-colors outline-none bg-gray-50/50" placeholder="john@example.com" /></div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3.5 border-2 border-gray-100 focus:border-primary rounded-xl transition-colors outline-none bg-gray-50/50" placeholder="+91 98765 43210" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label><input type="text" required value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-3.5 border-2 border-gray-100 focus:border-primary rounded-xl transition-colors outline-none bg-gray-50/50" placeholder="How can we help?" /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Message *</label><textarea required rows={5} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full px-4 py-3.5 border-2 border-gray-100 focus:border-primary rounded-xl transition-colors outline-none bg-gray-50/50 resize-none" placeholder="Tell us more..." /></div>
                  <Button variant="primary" size="lg" className="w-full"><Send size={18} className="mr-2" /> Send Message</Button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
