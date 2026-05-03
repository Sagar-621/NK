import { motion } from 'framer-motion'
import { Target, Heart, Zap, Users, ShieldCheck, Leaf } from 'lucide-react'
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

const values = [
  { icon: Heart, title: 'Customer First', desc: 'Every decision starts with how it benefits our customers.' },
  { icon: Zap, title: 'Speed Matters', desc: 'We obsess over reducing delivery time without compromising quality.' },
  { icon: ShieldCheck, title: 'Trust & Quality', desc: 'We partner only with verified stores to ensure freshness.' },
  { icon: Users, title: 'Community Driven', desc: 'We empower local merchants and delivery partners to grow.' },
  { icon: Leaf, title: 'Sustainability', desc: 'Eco-friendly packaging and optimized routes.' },
  { icon: Target, title: 'Innovation', desc: 'Constantly improving our technology to serve you better.' },
]

const timeline = [
  { year: '2021', title: 'The Beginning', desc: 'Started with a vision — India\'s local shopping, digitized.' },
  { year: '2022', title: 'First 100 Merchants', desc: 'Onboarded our first 100 partner stores across Bangalore.' },
  { year: '2023', title: '10K Customers', desc: 'Crossed 10,000 happy customers with a 4.8-star rating.' },
  { year: '2024', title: 'Multi-City Expansion', desc: 'Expanded to 5 cities with 500+ merchant partners.' },
]

export default function About() {
  return (
    <>
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-secondary-dark text-white pt-32 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div className="max-w-2xl" {...fadeInUp}>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">About NatooKart</h1>
            <p className="text-lg text-white/80 mt-6 leading-relaxed">
              We're on a mission to make fresh, quality groceries accessible to everyone — delivered in minutes, not hours.
            </p>
          </motion.div>
        </div>
        <div className="wave-divider">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none"><path d="M0,0 C480,60 960,60 1440,0 L1440,60 L0,60 Z" fill="white" /></svg>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeInUp}>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-navy">Our Mission</h2>
              <div className="w-16 h-1 bg-secondary rounded-full mt-4" />
              <p className="text-gray-500 mt-6 text-lg leading-relaxed">
                NatooKart was born from a simple idea — what if local shopping could be instant and digital? India's neighborhoods are full of amazing stores, and we bring them to your fingertips.
              </p>
              <p className="text-gray-500 mt-4 leading-relaxed">
                Today, we connect thousands of customers with their favorite local stores, ensuring fresh produce, dairy, snacks, and essentials arrive at their doorstep in minutes.
              </p>
            </motion.div>
            <motion.div className="relative" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div className="bg-gradient-to-br from-primary-50 to-secondary-light rounded-3xl p-10">
                <div className="grid grid-cols-2 gap-6">
                  {[{ num: '10K+', label: 'Customers' }, { num: '500+', label: 'Merchants' }, { num: '5', label: 'Cities' }, { num: '<15min', label: 'Avg delivery' }].map((s, i) => (
                    <div key={i} className="text-center">
                      <p className={`text-2xl sm:text-3xl font-black ${i % 2 === 0 ? 'text-primary' : 'text-secondary'}`}>{s.num}</p>
                      <p className="text-sm text-gray-600 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-navy">Our Values</h2>
            <div className="w-16 h-1 bg-secondary rounded-full mx-auto mt-4" />
          </motion.div>
          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={{ whileInView: { transition: { staggerChildren: 0.1 } } }}
            initial="initial" whileInView="whileInView" viewport={{ once: true, amount: 0.2 }}>
            {values.map((v, i) => (
              <motion.div key={i} variants={childFade}>
                <GlassCard className="h-full">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${i % 2 === 0 ? 'bg-primary/10' : 'bg-secondary/10'}`}>
                    <v.icon size={24} className={i % 2 === 0 ? 'text-primary' : 'text-secondary'} />
                  </div>
                  <h3 className="text-lg font-semibold text-navy">{v.title}</h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{v.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-navy">Our Journey</h2>
            <div className="w-16 h-1 bg-primary rounded-full mx-auto mt-4" />
          </motion.div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-secondary via-primary/50 to-transparent" />
            <motion.div className="space-y-10"
              variants={{ whileInView: { transition: { staggerChildren: 0.15 } } }}
              initial="initial" whileInView="whileInView" viewport={{ once: true, amount: 0.1 }}>
              {timeline.map((t, i) => (
                <motion.div key={i} variants={childFade} className="flex gap-6 items-start">
                  <div className={`w-12 h-12 rounded-full text-white flex items-center justify-center text-sm font-bold flex-shrink-0 z-10 ${
                    i % 2 === 0 ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-secondary shadow-lg shadow-secondary/30'
                  }`}>
                    {t.year.slice(2)}
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex-1 hover:shadow-md transition-shadow">
                    <p className={`text-xs font-bold mb-1 ${i % 2 === 0 ? 'text-primary' : 'text-secondary'}`}>{t.year}</p>
                    <h3 className="text-lg font-semibold text-navy">{t.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{t.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 dark-particle-dots">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Ready to join the NatooKart family?</h2>
            <p className="text-gray-400 mt-4 max-w-lg mx-auto">Whether you're a customer, merchant, or delivery partner — there's a place for you.</p>
            <a href="/#" className="inline-flex items-center px-8 py-4 bg-secondary text-white font-semibold rounded-2xl btn-3d mt-8">Download App</a>
          </motion.div>
        </div>
      </section>
    </>
  )
}
