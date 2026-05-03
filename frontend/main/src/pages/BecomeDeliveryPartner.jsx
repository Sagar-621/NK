import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Bike, Clock, Wallet, Shield, Smartphone, Heart, ArrowRight, Send } from 'lucide-react'
import Button from '../components/ui/Button'
import GlassCard from '../components/ui/GlassCard'

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] },
}

const childFade = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
}

const eligibility = [
  'Must be 18 years or older',
  'Valid government-issued ID (Aadhaar/PAN/DL)',
  'Own a vehicle — bicycle, motorcycle, or scooter',
  'Smartphone with internet connection',
  'Willingness to work flexible hours',
  'Clean driving record (for motorized vehicles)',
]

const benefits = [
  { icon: Wallet, title: 'Earn Well', desc: 'Competitive per-delivery pay plus tips and bonuses.' },
  { icon: Clock, title: 'Flexible Hours', desc: 'Work when you want. No fixed schedules or minimums.' },
  { icon: Shield, title: 'Insurance Cover', desc: 'Accident and medical insurance from day one.' },
  { icon: Smartphone, title: 'Easy App', desc: 'User-friendly partner app to manage your deliveries.' },
  { icon: Heart, title: 'Weekly Rewards', desc: 'Earn extra through weekly challenges and incentives.' },
  { icon: Bike, title: 'Free Gear', desc: 'Get branded delivery bag and rain jacket — free.' },
]

const COUNTRY_CODES = [
  { flag: '🇮🇳', name: 'India',        dial: '+91',  max: 10 },
  { flag: '🇺🇸', name: 'USA',          dial: '+1',   max: 10 },
  { flag: '🇬🇧', name: 'UK',           dial: '+44',  max: 10 },
  { flag: '🇦🇪', name: 'UAE',          dial: '+971', max: 9  },
  { flag: '🇸🇬', name: 'Singapore',    dial: '+65',  max: 8  },
  { flag: '🇦🇺', name: 'Australia',    dial: '+61',  max: 9  },
  { flag: '🇨🇦', name: 'Canada',       dial: '+1',   max: 10 },
  { flag: '🇩🇪', name: 'Germany',      dial: '+49',  max: 11 },
  { flag: '🇫🇷', name: 'France',       dial: '+33',  max: 9  },
  { flag: '🇯🇵', name: 'Japan',        dial: '+81',  max: 10 },
  { flag: '🇨🇳', name: 'China',        dial: '+86',  max: 11 },
  { flag: '🇧🇷', name: 'Brazil',       dial: '+55',  max: 11 },
  { flag: '🇿🇦', name: 'South Africa', dial: '+27',  max: 9  },
  { flag: '🇰🇷', name: 'South Korea',  dial: '+82',  max: 10 },
  { flag: '🇲🇽', name: 'Mexico',       dial: '+52',  max: 10 },
  { flag: '🇮🇩', name: 'Indonesia',    dial: '+62',  max: 12 },
  { flag: '🇵🇰', name: 'Pakistan',     dial: '+92',  max: 10 },
  { flag: '🇧🇩', name: 'Bangladesh',   dial: '+880', max: 10 },
  { flag: '🇵🇭', name: 'Philippines',  dial: '+63',  max: 10 },
  { flag: '🇹🇷', name: 'Turkey',       dial: '+90',  max: 10 },
  { flag: '🇳🇬', name: 'Nigeria',      dial: '+234', max: 10 },
  { flag: '🇰🇪', name: 'Kenya',        dial: '+254', max: 9  },
]

const FloatingPhoneInput = ({ onChange, label = 'Phone Number' }) => {
  const [country, setCountry] = useState(COUNTRY_CODES[0])
  const [digits, setDigits] = useState('')

  const handleCountryChange = (e) => {
    const selected = COUNTRY_CODES.find(c => `${c.dial}_${c.name}` === e.target.value)
    if (selected) {
      setCountry(selected)
      if (onChange) onChange(digits ? `${selected.dial}${digits}` : '')
    }
  }

  const handleDigitsChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, country.max)
    setDigits(raw)
    if (onChange) onChange(raw ? `${country.dial}${raw}` : '')
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-stretch border-2 border-gray-100 focus-within:border-primary rounded-xl overflow-hidden transition-colors">
        <div className="relative flex items-center bg-gray-50 border-r border-gray-200 px-2">
          <select
            value={`${country.dial}_${country.name}`}
            onChange={handleCountryChange}
            className="appearance-none bg-transparent text-sm font-medium pr-5 py-3.5 pl-1 outline-none cursor-pointer"
            style={{ minWidth: '80px' }}
          >
            {COUNTRY_CODES.map(c => (
              <option key={`${c.dial}_${c.name}`} value={`${c.dial}_${c.name}`}>
                {c.flag} {c.dial} {c.name}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-1 text-gray-400 text-xs">▼</span>
        </div>
        <input
          type="tel"
          inputMode="numeric"
          value={digits}
          onChange={handleDigitsChange}
          maxLength={country.max}
          placeholder={`${country.max} digits`}
          className="flex-1 px-3 py-3.5 outline-none text-sm bg-white"
        />
      </div>
      <p className="text-xs text-gray-400">{country.flag} {country.dial} — max {country.max} digits</p>
    </div>
  )
}

const steps = [
  { num: '01', title: 'Register Online', desc: 'Fill the simple form below with your details.' },
  { num: '02', title: 'Document Verification', desc: 'Upload ID proof and vehicle documents.' },
  { num: '03', title: 'Quick Training', desc: '30-minute virtual onboarding session.' },
  { num: '04', title: 'Start Earning', desc: 'Go online and accept your first delivery!' },
]

export default function BecomeDeliveryPartner() {
  const [formData, setFormData] = useState({ name: '', phone: '', city: '', vehicle: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const vehicleMap = { bicycle: 'Bicycle', scooter: 'Scooter', motorcycle: 'Bike', ev: 'Scooter' }
      const res = await fetch('/api/delivery-partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.name,
          mobile: formData.phone,
          city: formData.city,
          vehicle_type: vehicleMap[formData.vehicle] || 'Bike',
          status: 'pending',
        }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setSubmitted(true)
    } catch (err) {
      console.error('Delivery partner form error:', err)
      alert('Something went wrong. Please try again.')
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-secondary-dark text-white pt-32 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 mb-6">
              <Bike size={16} />
              <span className="text-sm font-medium">Join 200+ delivery partners</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Become a Delivery Partner</h1>
            <p className="text-lg text-white/80 mt-6 leading-relaxed">
              Earn on your own schedule. Deliver groceries in your city and be your own boss.
            </p>
          </motion.div>
        </div>
        <div className="wave-divider">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
            <path d="M0,0 C480,60 960,60 1440,0 L1440,60 L0,60 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-navy">Why partner with us?</h2>
            <div className="w-16 h-1 bg-secondary rounded-full mx-auto mt-4" />
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={{ whileInView: { transition: { staggerChildren: 0.08 } } }}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.2 }}
          >
            {benefits.map((b, i) => (
              <motion.div key={i} variants={childFade}>
                <GlassCard className="h-full">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${i % 2 === 0 ? 'bg-primary/10' : 'bg-secondary/10'}`}>
                    <b.icon size={24} className={i % 2 === 0 ? 'text-primary' : 'text-secondary'} />
                  </div>
                  <h3 className="text-lg font-semibold text-navy">{b.title}</h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{b.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How to Join — Steps */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-navy">How to join</h2>
            <div className="w-16 h-1 bg-secondary rounded-full mx-auto mt-4" />
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={{ whileInView: { transition: { staggerChildren: 0.1 } } }}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.2 }}
          >
            {steps.map((step, i) => (
              <motion.div
                key={i}
                variants={childFade}
                className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:translate-y-[-4px] hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className={`text-4xl font-black mb-2 ${i % 2 === 0 ? 'text-primary/10' : 'text-secondary/10'}`}>{step.num}</div>
                <h3 className="text-base font-semibold text-navy">{step.title}</h3>
                <p className="text-sm text-gray-500 mt-2">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight size={16} className="text-primary/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-navy">Eligibility</h2>
            <div className="w-16 h-1 bg-primary rounded-full mx-auto mt-4" />
          </motion.div>

          <motion.ul
            className="space-y-4"
            variants={{ whileInView: { transition: { staggerChildren: 0.1 } } }}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.2 }}
          >
            {eligibility.map((item, i) => (
              <motion.li
                key={i}
                variants={childFade}
                className="flex items-center gap-4 bg-[#F8FAFC] rounded-2xl px-6 py-4"
              >
                <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={18} className="text-secondary" />
                </div>
                <span className="text-gray-700 font-medium">{item}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-24 dark-particle-dots">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Ready to start?</h2>
            <p className="text-gray-400 mt-4">Fill the form below and we'll reach out to you.</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-navy">Application Received!</h3>
                <p className="text-gray-500 mt-2">We'll call you within 48 hours to proceed.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-100 focus:border-primary rounded-xl transition-colors outline-none"
                    placeholder="Enter your name"
                  />
                </div>
                <FloatingPhoneInput
                  label="Phone Number *"
                  value={formData.phone}
                  onChange={(val) => setFormData({ ...formData, phone: val })}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-100 focus:border-primary rounded-xl transition-colors outline-none"
                    placeholder="e.g. Bangalore"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type *</label>
                  <select
                    required
                    value={formData.vehicle}
                    onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-100 focus:border-primary rounded-xl transition-colors outline-none appearance-none bg-white"
                  >
                    <option value="">Select vehicle</option>
                    <option value="bicycle">Bicycle</option>
                    <option value="scooter">Scooter</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="ev">Electric Vehicle</option>
                  </select>
                </div>
                <Button type="submit" variant="primary" size="lg" className="w-full mt-2">
                  <Send size={18} className="mr-2" /> Submit Application
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </>
  )
}
