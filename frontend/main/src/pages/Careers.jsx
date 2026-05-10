import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Clock, ArrowRight, X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import Button from '../components/ui/Button'
import { SkeletonBlock, SkeletonText, SubmittingSkeleton } from '../components/ui/Skeleton'

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

// ───────────────────────────────────────────────────
// APPLY MODAL
// ───────────────────────────────────────────────────
function ApplyModal({ job, onClose }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', cover_message: '' })
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeName, setResumeName] = useState('')
  const [dragging, setDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  // Trap scroll behind modal
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) { setResumeFile(file); setResumeName(file.name) }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) { setResumeFile(file); setResumeName(file.name) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.full_name || !form.email) {
      setError('Please fill in your name and email.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('job_id',        job.id)
      fd.append('full_name',     form.full_name)
      fd.append('email',         form.email)
      fd.append('phone',         form.phone)
      fd.append('cover_message', form.cover_message)
      if (resumeFile) fd.append('resume', resumeFile)

      const res = await fetch('/api/job-applications', { method: 'POST', body: fd })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to submit')
      }
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Apply for Role</p>
            <h3 className="text-xl font-bold text-navy leading-tight">{job.title}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${deptColors[job.department] || 'bg-gray-50 text-gray-600'}`}>
                {job.department}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 flex items-center gap-1">
                <MapPin size={10} /> {job.location}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 flex items-center gap-1">
                <Clock size={10} /> {job.job_type}
              </span>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0 ml-3">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {submitting ? (
              <motion.div key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-6">
                <SubmittingSkeleton label="Submitting your application…" />
              </motion.div>
            ) : submitted ? (
              <motion.div key="success"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="p-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-5">
                  <CheckCircle2 size={40} className="text-secondary" />
                </div>
                <h4 className="text-xl font-bold text-navy">Application Sent! 🎉</h4>
                <p className="text-gray-500 mt-3 max-w-xs leading-relaxed">
                  Thanks for applying, <strong>{form.full_name}</strong>! We'll review your profile and get back to you soon.
                </p>
                <p className="text-xs text-gray-400 mt-4 bg-gray-50 rounded-xl px-4 py-3">
                  📬 A confirmation will be sent to <strong>{form.email}</strong>
                </p>
                <button onClick={onClose}
                  className="mt-8 px-8 py-3 bg-primary text-white rounded-2xl font-semibold hover:bg-primary/90 transition-colors">
                  Done
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-6 space-y-4">

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                    <AlertCircle size={15} className="flex-shrink-0" /> {error}
                  </div>
                )}

                {/* Name + Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name <span className="text-primary">*</span>
                    </label>
                    <input required value={form.full_name}
                      onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                      placeholder="Rahul Sharma"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email <span className="text-primary">*</span>
                    </label>
                    <input required type="email" value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="rahul@example.com"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors" />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone (Optional)</label>
                  <input type="tel" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors" />
                </div>

                {/* Resume drag & drop */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Resume / CV</label>
                  <div
                    onDragOver={e => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-2 p-7 border-2 border-dashed rounded-2xl cursor-pointer transition-all
                      ${dragging
                        ? 'border-primary bg-primary/5 scale-[1.01]'
                        : resumeFile
                          ? 'border-secondary bg-secondary/5'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                  >
                    <input ref={fileInputRef} type="file" className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileChange} />

                    {resumeFile ? (
                      <>
                        <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center">
                          <FileText size={22} className="text-secondary" />
                        </div>
                        <p className="text-sm font-medium text-navy text-center truncate max-w-[220px]">{resumeName}</p>
                        <p className="text-xs text-gray-400">{(resumeFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                        <span className="text-xs text-secondary font-medium">Click to replace</span>
                      </>
                    ) : (
                      <>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors
                          ${dragging ? 'bg-primary/15' : 'bg-gray-100'}`}>
                          <Upload size={22} className={dragging ? 'text-primary' : 'text-gray-400'} />
                        </div>
                        <p className="text-sm font-medium text-gray-700">
                          {dragging ? 'Drop it here!' : 'Drag & drop your resume'}
                        </p>
                        <p className="text-xs text-gray-400">or <span className="text-primary font-medium">click to browse</span></p>
                        <p className="text-[11px] text-gray-300 mt-1">PDF, DOC, DOCX, JPG, PNG — max 10 MB</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Cover message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Cover Message <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <textarea rows={3} value={form.cover_message}
                    onChange={e => setForm(f => ({ ...f, cover_message: e.target.value }))}
                    placeholder="Tell us why you'd be a great fit…"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors resize-none" />
                </div>

                {/* Notice */}
                <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3">
                  💬 We review every application carefully and will get back to you within 5–7 business days.
                </p>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    Submit Application <ArrowRight size={16} />
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

// ───────────────────────────────────────────────────
// MAIN CAREERS PAGE
// ───────────────────────────────────────────────────
export default function Careers() {
  const [activeJobs, setActiveJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [applyJob, setApplyJob] = useState(null)   // job object when modal open

  useEffect(() => {
    fetch('/api/jobs?status=active')
      .then(res => res.json())
      .then(data => { setActiveJobs(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <>
      {/* Apply Modal */}
      <AnimatePresence>
        {applyJob && (
          <ApplyModal key="apply-modal" job={applyJob} onClose={() => setApplyJob(null)} />
        )}
      </AnimatePresence>

      {/* Hero */}
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

      {/* Perks */}
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

      {/* Open Positions */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-navy">Open Positions</h2>
            <div className="w-16 h-1 bg-primary rounded-full mx-auto mt-4" />
            {!loading && (
              <p className="text-gray-500 mt-4">{activeJobs.length} open role{activeJobs.length !== 1 ? 's' : ''} — find your fit.</p>
            )}
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <SkeletonBlock className="w-24 h-6 rounded-full" />
                    <SkeletonBlock className="w-28 h-6 rounded-full" />
                    <SkeletonBlock className="w-20 h-6 rounded-full" />
                  </div>
                  <SkeletonText width="w-3/4" className="h-5 mb-3" />
                  <SkeletonText className="mb-1.5" />
                  <SkeletonText width="w-5/6" className="mb-4" />
                  <SkeletonBlock className="w-28 h-10 rounded-xl mt-4" />
                </div>
              ))}
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
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed line-clamp-2">{job.description}</p>
                  {job.deadline && (
                    <p className="text-xs text-gray-400 mt-2">
                      Apply by: {new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                  <button
                    onClick={() => setApplyJob(job)}
                    className={`mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-300 ${
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
    </>
  )
}
