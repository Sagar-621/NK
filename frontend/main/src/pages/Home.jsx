import { motion } from 'framer-motion'
import { Smartphone, ShoppingCart, CreditCard, Bike, PackageCheck, MapPin, Phone, Mail } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import AnimatedCounter from '../components/ui/AnimatedCounter'
import Button from '../components/ui/Button'

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] },
}

const stagger = {
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true, amount: 0.2 },
}

const childFade = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
}

// ===================== HERO =====================
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center hero-gradient grid-dots overflow-hidden pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-0">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-8 items-center">
          {/* LEFT — Copy (60%) */}
          <motion.div className="lg:col-span-3 space-y-8" {...fadeInUp}>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-secondary/30 bg-secondary/10"
            >
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-sm font-medium text-secondary-dark">Now delivering near you</span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-navy leading-[1.1]">
              Fresh groceries,{' '}
              <br className="hidden sm:block" />
              delivered in{' '}
              <span className="text-primary wave-underline">minutes</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-gray-500 max-w-md leading-relaxed">
              India's Local Shopping App — order from your favorite stores and get fresh produce, dairy, snacks & essentials delivered to your door.
            </p>

            {/* Download Buttons */}
            <div className="flex flex-wrap gap-4">
              <a href="#" className="flex items-center gap-3 bg-navy text-white rounded-2xl px-5 py-3 hover:translate-y-[-2px] hover:shadow-xl transition-all duration-300">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div>
                  <div className="text-[10px] text-gray-400 leading-none">Download on the</div>
                  <div className="text-sm font-semibold leading-tight">App Store</div>
                </div>
              </a>
              <a href="#" className="flex items-center gap-3 bg-navy text-white rounded-2xl px-5 py-3 hover:translate-y-[-2px] hover:shadow-xl transition-all duration-300">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M3.609 1.814L13.792 12 3.609 22.186a.996.996 0 01-.609-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302-2.302 2.302-2.698-2.302 2.698-2.302zM5.864 2.658L16.801 8.99l-2.302 2.302-8.635-8.634z"/>
                </svg>
                <div>
                  <div className="text-[10px] text-gray-400 leading-none">Get it on</div>
                  <div className="text-sm font-semibold leading-tight">Google Play</div>
                </div>
              </a>
            </div>

            {/* Trust Row */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex -space-x-2">
                {['#7C1130', '#16A34A', '#3B82F6'].map((bg, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold" style={{ background: bg, zIndex: 3 - i }}>
                    {['A', 'R', 'S'][i]}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-500 font-medium">4.8 rating</span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500 font-medium">10,000+ happy customers</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT — 3D Phone Mockup (40%) */}
          <motion.div
            className="lg:col-span-2 relative flex justify-center"
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
          >
            {/* Maroon glow behind phone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/15 rounded-full blur-[80px] z-0" />

            {/* Phone */}
            <div className="relative z-10 phone-3d">
              <div className="w-56 sm:w-64 lg:w-72 bg-white rounded-[2.5rem] border-[6px] border-gray-800 shadow-2xl overflow-hidden">
                <div className="bg-gray-800 h-6 flex items-center justify-center">
                  <div className="w-16 h-3 bg-gray-900 rounded-full" />
                </div>
                <div className="bg-gradient-to-b from-primary-50 to-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-500">Deliver to</p>
                      <p className="text-xs font-bold text-navy">📍 Home</p>
                    </div>
                    <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs">🔔</span>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-xl px-3 py-2">
                    <p className="text-[10px] text-gray-400">🔍 Search groceries...</p>
                  </div>
                  <div className="bg-gradient-to-r from-secondary to-secondary-dark rounded-xl p-3 text-white">
                    <p className="text-[10px] font-bold">🎉 50% OFF</p>
                    <p className="text-[9px] mt-0.5 opacity-80">On your first order!</p>
                  </div>
                  <p className="text-[10px] font-bold text-navy">Popular Categories</p>
                  <div className="grid grid-cols-4 gap-2">
                    {['🥬', '🥛', '🍎', '🍞'].map((emoji, i) => (
                      <div key={i} className="bg-white rounded-lg p-2 text-center shadow-sm border border-gray-100">
                        <span className="text-lg">{emoji}</span>
                        <p className="text-[7px] text-gray-500 mt-0.5">{['Veggies', 'Dairy', 'Fruits', 'Bakery'][i]}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-navy">Best Sellers</p>
                  <div className="space-y-2">
                    {[
                      { name: 'Organic Bananas', price: '₹45', emoji: '🍌' },
                      { name: 'Fresh Milk 500ml', price: '₹28', emoji: '🥛' },
                      { name: 'Brown Eggs (6pc)', price: '₹72', emoji: '🥚' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm border border-gray-100">
                        <span className="text-lg">{item.emoji}</span>
                        <div className="flex-1">
                          <p className="text-[9px] font-semibold text-navy">{item.name}</p>
                          <p className="text-[8px] text-primary font-bold">{item.price}</p>
                        </div>
                        <div className="bg-primary text-white text-[8px] font-bold px-2 py-0.5 rounded-md">ADD</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Chips */}
            <div className="absolute top-8 -left-4 sm:left-0 z-20 animate-float">
              <div className="glass rounded-2xl px-4 py-2.5 shadow-lg border border-white/60">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-xs">✓</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-navy">Order placed!</p>
                    <p className="text-[8px] text-gray-400">Just now</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-16 -right-4 sm:right-0 z-20 animate-float-delayed">
              <div className="glass rounded-2xl px-4 py-2.5 shadow-lg border border-white/60">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-xs">🚴</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-navy">Out for delivery</p>
                    <p className="text-[8px] text-gray-400">Arriving in 8 min</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ===================== HOW IT WORKS =====================
const steps = [
  { icon: Smartphone, title: 'Order from App', desc: 'Browse and add your favorite products from our easy-to-use app.' },
  { icon: ShoppingCart, title: 'Choose Products', desc: 'Select from thousands of quality items across categories.' },
  { icon: CreditCard, title: 'Do Payment', desc: 'Pay securely with UPI, cards, wallets, or cash on delivery.' },
  { icon: Bike, title: 'Delivery Assigned', desc: 'A nearby delivery partner picks up your order instantly.' },
  { icon: PackageCheck, title: 'Delivered!', desc: 'Get your groceries at your doorstep in just minutes.' },
]

function HowItWorksSection() {
  return (
    <section className="py-24 bg-[#F8FAFC] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-16" {...fadeInUp}>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-navy">How it works</h2>
          <div className="w-16 h-1 bg-secondary rounded-full mx-auto mt-4" />
          <p className="text-gray-500 mt-4 max-w-lg mx-auto">
            Getting your groceries delivered is as easy as 1-2-3. Here's how NatooKart works.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-[72px] left-[10%] right-[10%] z-0">
            <svg width="100%" height="4" className="overflow-visible">
              <line x1="0" y1="2" x2="100%" y2="2" className="connector-line" strokeWidth="2" fill="none" />
            </svg>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10"
            variants={{ whileInView: { transition: { staggerChildren: 0.1 } } }}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.2 }}
          >
            {steps.map((step, i) => (
              <motion.div key={i} variants={childFade}>
                <GlassCard className="text-center h-full">
                  <div className="flex flex-col items-center gap-4">
                    <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center text-sm font-bold shadow-lg ${
                      i % 2 === 0
                        ? 'bg-gradient-to-br from-primary to-primary-dark'
                        : 'bg-gradient-to-br from-secondary to-secondary-dark'
                    }`}>
                      {i + 1}
                    </div>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      i % 2 === 0 ? 'bg-primary/10' : 'bg-secondary/10'
                    }`}>
                      <step.icon size={28} className={i % 2 === 0 ? 'text-primary' : 'text-secondary'} />
                    </div>
                    <h3 className="text-lg font-semibold text-navy">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ===================== STATS =====================
const stats = [
  { target: 10000, suffix: '+', label: 'Happy customers' },
  { target: 500, suffix: '+', label: 'Partner merchants' },
  { target: 200, suffix: '+', label: 'Delivery partners' },
  { target: 4.8, suffix: ' ★', label: 'App store rating' },
]

function StatsSection() {
  return (
    <section className="py-24 dark-particle-dots relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-16" {...fadeInUp}>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Numbers that speak</h2>
          <div className="w-16 h-1 bg-secondary rounded-full mx-auto mt-4" />
          <p className="text-gray-400 mt-4 max-w-lg mx-auto">
            Trusted by thousands of customers and growing every day.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          variants={{ whileInView: { transition: { staggerChildren: 0.1 } } }}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, amount: 0.2 }}
        >
          {stats.map((stat, i) => (
            <motion.div key={i} variants={childFade} className="stat-card p-8 text-center">
              <div className={`w-12 h-0.5 rounded-full mx-auto mb-6 ${i % 2 === 0 ? 'bg-secondary' : 'bg-primary'}`} />
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-none">
                <AnimatedCounter target={stat.target} suffix="" />
                <span className="text-green-500">{stat.suffix}</span>
              </div>
              <p className="text-sm text-gray-400 mt-3 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ===================== CONTACT =====================
function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '', _honey: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData._honey) {
      setSubmitted(true)
      return
    }

    try {
      const response = await fetch('/api/contact-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message
        })
      });

      if (response.ok) {
        setSubmitted(true)
        setTimeout(() => setSubmitted(false), 5000)
        setFormData({ name: '', email: '', phone: '', message: '', _honey: '' })
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Contact error:', err);
      alert('An error occurred. Please check your connection.');
    }
  }

  const contactInfo = [
    { icon: MapPin, label: 'Our Office', value: '123 Commerce Street, Tech Hub, Bangalore 560001' },
    { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
    { icon: Mail, label: 'Email', value: 'hello@natookart.com' },
  ]

  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-16" {...fadeInUp}>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-navy">Get in touch</h2>
          <div className="w-16 h-1 bg-secondary rounded-full mx-auto mt-4" />
          <p className="text-gray-500 mt-4 max-w-lg mx-auto">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12">
          <motion.div className="lg:col-span-3" {...fadeInUp}>
            <div className="bg-white rounded-3xl shadow-contact p-8 sm:p-10" style={{ transform: 'rotateX(1deg)' }}>
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-navy">Message Sent!</h3>
                  <p className="text-gray-500 mt-2">We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Honeypot — hidden from users, catches bots */}
                  <input
                    type="text"
                    name="_honey"
                    value={formData._honey}
                    onChange={(e) => setFormData({ ...formData, _honey: e.target.value })}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input type="text" required value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border-0 border-b-2 border-gray-100 focus:border-primary focus:ring-0 bg-gray-50/50 rounded-xl transition-colors outline-none"
                        placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input type="email" required value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border-0 border-b-2 border-gray-100 focus:border-primary focus:ring-0 bg-gray-50/50 rounded-xl transition-colors outline-none"
                        placeholder="john@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input type="tel" value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border-0 border-b-2 border-gray-100 focus:border-primary focus:ring-0 bg-gray-50/50 rounded-xl transition-colors outline-none"
                      placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea required rows={4} value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 border-0 border-b-2 border-gray-100 focus:border-primary focus:ring-0 bg-gray-50/50 rounded-xl transition-colors outline-none resize-none"
                      placeholder="Tell us how we can help..." />
                  </div>
                  <Button variant="primary" size="lg" className="w-full">Send Message</Button>
                </form>
              )}
            </div>
          </motion.div>

          <motion.div className="lg:col-span-2 space-y-6"
            variants={{ whileInView: { transition: { staggerChildren: 0.1 } } }}
            initial="initial" whileInView="whileInView" viewport={{ once: true, amount: 0.2 }}>
            {contactInfo.map((info, i) => (
              <motion.div key={i} variants={childFade}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300 cursor-default">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <info.icon size={22} className="text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">{info.label}</p>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{info.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Need useState for ContactSection
import { useState } from 'react'

export default function Home() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <StatsSection />
      <ContactSection />
    </>
  )
}
