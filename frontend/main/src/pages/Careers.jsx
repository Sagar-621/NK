import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Clock, Briefcase, ArrowRight, Loader2 } from 'lucide-react'
import Button from '../components/ui/Button'

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

const perks = [
  { emoji: '🏠', title: 'Remote Friendly', desc: 'Work from anywhere in India' },
  { emoji: '📈', title: 'ESOPs', desc: 'Own a piece of NatooKart' },
  { emoji: '🏥', title: 'Health Insurance', desc: 'Coverage for you & family' },
  { emoji: '📚', title: 'Learning Budget', desc: '₹50K/year for courses' },
  { emoji: '🍕', title: 'Free Groceries', desc: 'Monthly NatooKart credits' },
  { emoji: '🎯', title: 'Fast Growth', desc: 'Rapid career progression' },
]

const deptColors = {
  Engineering: 'bg-blue-50 text-blue-600',
  Marketing: 'bg-purple-50 text-purple-600',
  Operations: 'bg-orange-50 text-orange-600',
  Logistics: 'bg-cyan-50 text-cyan-600',
  'Customer Support': 'bg-pink-50 text-pink-600',
  HR: 'bg-green-50 text-green-600',
  Finance: 'bg-yellow-50 text-yellow-600',
}

export default function Careers() {
  const [activeJobs, setActiveJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/jobs?status=active')
      .then(res => res.json())
      .then(data => { setActiveJobs(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <>
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-secondary-dark text-white pt-32 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div className="max-w-2xl" {...fadeInUp}>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Join Our Team</h1>
            <p className="text-lg text-white/80 mt-6 leading-relaxed">
              Help us reimagine how millions get their daily essentials. Build the future of local commerce.
            </p>
          </motion.div>
        </div>
        <div className="wave-divider">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none"><path d="M0,0 C480,60 960,60 1440,0 L1440,60 L0,60 Z" fill="white" /></svg>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-navy">Why work with us?</h2>
            <div className="w-16 h-1 bg-secondary rounded-full mx-auto mt-4" />
          </motion.div>
          <motion.div className="grid grid-cols-2 lg:grid-cols-3 gap-6"
            variants={{ whileInView: { transition: { staggerChildren: 0.08 } } }}
            initial="initial" whileInView="whileInView" viewport={{ once: true, amount: 0.2 }}>
            {perks.map((p, i) => (
              <motion.div key={i} variants={childFade}
                className="bg-[#F8FAFC] rounded-2xl p-6 hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300">
                <span className="text-3xl">{p.emoji}</span>
                <h3 className="text-base font-semibold text-navy mt-3">{p.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-navy">Open Positions</h2>
            <div className="w-16 h-1 bg-primary rounded-full mx-auto mt-4" />
            {!loading && <p className="text-gray-500 mt-4">{activeJobs.length} open role{activeJobs.length !== 1 ? 's' : ''} — find your fit.</p>}
          </motion.div>

          {loading ? (
            <div className="text-center py-16">
              <Loader2 size={32} className="animate-spin text-secondary mx-auto" />
              <p className="text-gray-400 mt-4">Loading positions...</p>
            </div>
          ) : activeJobs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">No open positions right now. Check back soon!</p>
            </div>
          ) : (
            <motion.div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto"
              variants={{ whileInView: { transition: { staggerChildren: 0.08 } } }}
              initial="initial" whileInView="whileInView" viewport={{ once: true, amount: 0.1 }}>
              {activeJobs.map((job) => (
                <motion.div key={job.id} variants={childFade}
                  className="bg-white rounded-2xl p-6 border border-gray-100 card-3d hover:border-primary/20 transition-all group">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${deptColors[job.department] || 'bg-gray-50 text-gray-600'}`}>
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
                      <MapPin size={12} /> {job.location}
                    </span>
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
                      <Clock size={12} /> {job.job_type}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-navy">{job.title}</h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{job.description}</p>
                  {job.deadline && (
                    <p className="text-xs text-gray-400 mt-2">Apply by: {new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  )}
                  <button className={`mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-300 ${
                    job.id % 2 === 0
                      ? 'border-secondary text-secondary hover:bg-secondary hover:text-white'
                      : 'border-primary text-primary hover:bg-primary hover:text-white'
                  }`}>
                    Apply now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <section className="py-24 dark-particle-dots">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Don't see your role?</h2>
            <p className="text-gray-400 mt-4 max-w-lg mx-auto">We're always looking for talented people. Send us your resume.</p>
            <a href="mailto:careers@natookart.com" className="inline-flex items-center px-8 py-4 bg-secondary text-white font-semibold rounded-2xl btn-3d mt-8">Send your resume</a>
          </motion.div>
        </div>
      </section>
    </>
  )
}
