import { useState, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CheckCircle2, Bike, Clock, Wallet, Shield, Smartphone,
  Heart, ChevronLeft, ChevronRight, Check, AlertCircle, Upload, FileText,
} from 'lucide-react'
import Button from '../components/ui/Button'
import GlassCard from '../components/ui/GlassCard'
import { SubmittingSkeleton } from '../components/ui/Skeleton'

// ── Age helper ───────────────────────────────────────────────
function getAge(dob) {
  if (!dob) return 0
  const diff = Date.now() - new Date(dob).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

// ── Validation schemas ───────────────────────────────────────
const step1Schema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email:     z.string().email('Enter a valid email'),
  date_of_birth: z.string().refine(v => v && getAge(v) >= 18, {
    message: 'You must be at least 18 years old',
  }),
})

const step2Schema = z.object({
  id_type:   z.string().min(1, 'Select an ID type'),
  id_number: z.string().min(1, 'ID number is required'),
}).refine((data) => {
  const val = data.id_number.replace(/[-\s]/g, '').toUpperCase();
  if (data.id_type === 'Aadhaar') {
    return /^\d{12}$/.test(val);
  }
  if (data.id_type === 'PAN') {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val);
  }
  if (data.id_type === 'Driving License') {
    // Standard Indian DL: 15 chars total (SSRR YYYYNNNNNNN)
    return /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/.test(val);
  }
  return true;
}, {
  message: 'Invalid format for the selected ID type',
  path: ['id_number'],
})

const step3Schema = z.object({
  mobile:       z.string().min(8, 'Enter a valid phone number'),
  city:         z.string().min(2, 'City is required'),
  vehicle_type: z.string().min(1, 'Select a vehicle type'),
})

const schemas = [step1Schema, step2Schema, step3Schema]

const stepInfo = [
  { label: 'Personal Info',     subtitle: 'Name, email, and date of birth' },
  { label: 'ID Verification',  subtitle: 'Government-issued identity document' },
  { label: 'Location & Vehicle', subtitle: 'Where you work and your vehicle' },
  { label: 'Eligibility & Submit', subtitle: 'Confirm your eligibility and submit' },
]

const vehicleOptions = [
  { value: 'Bike',    label: ' Motorcycle' },
  { value: 'Scooter', label: ' Scooter / Electric Vehicle' },
  { value: 'Car',     label: ' Car' },
]

const idTypes = ['Aadhaar', 'PAN', 'Driving License']

const benefits = [
  { icon: Wallet,     title: 'Earn Well',       desc: 'Competitive per-delivery pay plus tips and bonuses.' },
  { icon: Clock,      title: 'Flexible Hours',  desc: 'Work when you want. No fixed schedules or minimums.' },
  { icon: Shield,     title: 'Insurance Cover', desc: 'Accident and medical insurance from day one.' },
  { icon: Smartphone, title: 'Easy App',        desc: 'User-friendly partner app to manage deliveries.' },
  { icon: Heart,      title: 'Weekly Rewards',  desc: 'Earn extra through weekly challenges and incentives.' },
  { icon: Bike,       title: 'Free Gear',       desc: 'Get branded delivery bag and rain jacket — free.' },
]

// ── Phone Input ──────────────────────────────────────────────
const COUNTRY_CODES = [
  { flag: '🇮🇳', name: 'India',     dial: '+91',  max: 10 },
  { flag: '🇺🇸', name: 'USA',       dial: '+1',   max: 10 },
  { flag: '🇬🇧', name: 'UK',        dial: '+44',  max: 10 },
  { flag: '🇦🇪', name: 'UAE',       dial: '+971', max: 9  },
  { flag: '🇸🇬', name: 'Singapore', dial: '+65',  max: 8  },
  { flag: '🇦🇺', name: 'Australia', dial: '+61',  max: 9  },
]

const FloatingPhoneInput = ({ value, onChange, error }) => {
  const [country, setCountry] = useState(COUNTRY_CODES[0])
  const [digits,  setDigits]  = useState('')

  const handleCountry = (e) => {
    const c = COUNTRY_CODES.find(x => `${x.dial}_${x.name}` === e.target.value) || COUNTRY_CODES[0]
    setCountry(c)
    if (onChange) onChange(digits ? `${c.dial}${digits}` : '')
  }
  const handleDigits = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, country.max)
    setDigits(raw)
    if (onChange) onChange(raw ? `${country.dial}${raw}` : '')
  }

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
      <div className={`flex items-stretch border-2 rounded-xl overflow-hidden transition-colors ${error ? 'border-red-400' : 'border-gray-100 focus-within:border-primary'}`}>
        <div className="relative flex items-center bg-gray-50 border-r border-gray-200 px-2">
          <select value={`${country.dial}_${country.name}`} onChange={handleCountry}
            className="appearance-none bg-transparent text-sm font-medium pr-5 py-3.5 pl-1 outline-none cursor-pointer"
            style={{ minWidth: '80px' }}>
            {COUNTRY_CODES.map(c => (
              <option key={`${c.dial}_${c.name}`} value={`${c.dial}_${c.name}`}>{c.flag} {c.dial}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-1 text-gray-400 text-xs">▼</span>
        </div>
        <input type="tel" inputMode="numeric" value={digits} onChange={handleDigits}
          maxLength={country.max} placeholder={`${country.max} digits`}
          className="flex-1 px-3 py-3.5 outline-none text-sm bg-white" />
      </div>
      {error && <p className="text-red-500 text-xs pl-1">{error}</p>}
    </div>
  )
}

// ── Reusable field components ─────────────────────────────────
const Field = forwardRef(({ label, error, type = 'text', required, ...props }, ref) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}{required && ' *'}</label>
    <input ref={ref} type={type}
      className={`w-full px-4 py-3.5 border-2 rounded-xl transition-colors outline-none text-sm
        ${error ? 'border-red-400 bg-red-50' : 'border-gray-100 focus:border-primary bg-white'}`}
      {...props} />
    {error && <p className="text-red-500 text-xs pl-1 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
  </div>
))

const SelectField = forwardRef(({ label, error, options, placeholder, required, ...props }, ref) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}{required && ' *'}</label>
    <select ref={ref}
      className={`w-full px-4 py-3.5 border-2 rounded-xl transition-colors outline-none text-sm appearance-none bg-white
        ${error ? 'border-red-400' : 'border-gray-100 focus:border-primary'}`}
      {...props}>
      <option value="">{placeholder || `Select ${label}`}</option>
      {options.map(o => (
        <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
          {typeof o === 'string' ? o : o.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs pl-1 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
  </div>
))

// ── Checkbox row ─────────────────────────────────────────────
const CheckRow = ({ checked, onChange, children }) => (
  <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all
    ${checked ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
    <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
      ${checked ? 'bg-primary border-primary' : 'border-gray-300'}`}>
      {checked && <Check size={12} className="text-white" strokeWidth={3} />}
    </div>
    <input type="checkbox" className="hidden" checked={checked} onChange={e => onChange(e.target.checked)} />
    <span className="text-sm text-gray-700 leading-relaxed">{children}</span>
  </label>
)

// ── Review row ───────────────────────────────────────────────
const ReviewRow = ({ label, value }) => (
  <div className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0">
    <span className="text-gray-400 font-medium">{label}</span>
    <span className="text-navy font-semibold text-right max-w-[60%]">{value || '—'}</span>
  </div>
)

// ── Main Component ───────────────────────────────────────────
export default function BecomeDeliveryPartner() {
  const [step,       setStep]       = useState(0)
  const [allData,    setAllData]    = useState({})
  const [submitted,  setSubmitted]  = useState(false)
  const [formError,  setFormError]  = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Eligibility checkboxes (step 4)
  const [hasSmartphone,  setHasSmartphone]  = useState(false)
  const [flexibleHours,  setFlexibleHours]  = useState(false)
  const [cleanRecord,    setCleanRecord]    = useState(false)

  // ID Proof File
  const [idProofFile,    setIdProofFile]    = useState(null)
  const [fileName,       setFileName]       = useState('')

  const { register, handleSubmit, formState: { errors }, reset, control, watch } = useForm({
    resolver: step < 3 ? zodResolver(schemas[step]) : undefined,
    mode: 'onChange',
  })

  const selectedIdType = watch('id_type')

  const getIdPlaceholder = () => {
    if (selectedIdType === 'Aadhaar') return 'Enter 12-digit Aadhaar number'
    if (selectedIdType === 'PAN') return 'Enter 10-char PAN (e.g. ABCDE1234F)'
    if (selectedIdType === 'Driving License') return 'Enter DL (e.g. KA01 20230000000)'
    return 'Select ID type first'
  }

  const onNext = (data) => {
    const merged = { ...allData, ...data }
    setAllData(merged)
    reset(merged)
    setStep(s => s + 1)
  }
  const onBack = () => setStep(s => Math.max(0, s - 1))

  const allChecked = hasSmartphone && flexibleHours && cleanRecord

  const onFinalSubmit = async () => {
    if (!allChecked) {
      setFormError('Please confirm all eligibility requirements to proceed.')
      return
    }
    setSubmitting(true)
    setFormError('')
    try {
      const formData = new FormData()
      formData.append('full_name',      allData.full_name)
      formData.append('email',          allData.email)
      formData.append('date_of_birth',  allData.date_of_birth)
      formData.append('id_type',        allData.id_type)
      formData.append('id_number',      allData.id_number)
      formData.append('mobile',         allData.mobile)
      formData.append('city',           allData.city)
      formData.append('vehicle_type',   allData.vehicle_type)
      formData.append('has_smartphone', hasSmartphone)
      formData.append('flexible_hours', flexibleHours)
      formData.append('clean_record',   cleanRecord)
      formData.append('status',         'pending')
      
      if (idProofFile) {
        formData.append('id_proof', idProofFile)
      }

      const res = await fetch('/api/delivery-partners', {
        method:  'POST',
        body:    formData,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to submit')
      }
      setSubmitted(true)
    } catch (err) {
      setFormError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const progress = (step / 3) * 100

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-secondary-dark text-white pt-32 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div className="max-w-2xl" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 mb-6">
              <Bike size={16} /><span className="text-sm font-medium">Join 200+ delivery partners</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Become a Delivery Partner</h1>
            <p className="text-lg text-white/80 mt-6 leading-relaxed">
              Earn on your schedule. Deliver groceries in your city and be your own boss.
            </p>
          </motion.div>
        </div>
        <div className="wave-divider">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
            <path d="M0,0 C480,60 960,60 1440,0 L1440,60 L0,60 Z" fill="#F8FAFC" />
          </svg>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-navy">Why partner with us?</h2>
            <div className="w-16 h-1 bg-secondary rounded-full mx-auto mt-4" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <GlassCard key={i} className="h-full">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${i % 2 === 0 ? 'bg-primary/10' : 'bg-secondary/10'}`}>
                  <b.icon size={24} className={i % 2 === 0 ? 'text-primary' : 'text-secondary'} />
                </div>
                <h3 className="text-lg font-semibold text-navy">{b.title}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{b.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-24 dark-particle-dots">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Apply Now</h2>
            <p className="text-gray-400 mt-3">Takes less than 3 minutes. We'll reach out within 48 hours.</p>
          </div>

          {/* Step progress — hidden while submitting or after success */}
          {!submitted && !submitting && (
            <div className="mb-10">
              <div className="relative flex items-center justify-between">
                <div className="step-progress-line left-0 right-0">
                  <div className="step-progress-fill" style={{ width: `${progress}%` }} />
                </div>
                {stepInfo.map((s, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500
                      ${i < step  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                        : i === step ? 'bg-white text-primary ring-2 ring-primary shadow-lg'
                        : 'bg-gray-700 text-gray-400'}`}>
                      {i < step ? <Check size={18} /> : i + 1}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-medium mt-2 text-center leading-tight max-w-[72px]
                      ${i <= step ? 'text-white' : 'text-gray-500'}`}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {submitting ? (
              <motion.div key="submitting"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
              >
                <SubmittingSkeleton label="Submitting your application…" />
              </motion.div>
            ) : submitted ? (
              <motion.div key="success"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[28px] shadow-xl p-10 sm:p-14 text-center">
                <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} className="text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-navy">Application Received!</h3>
                <p className="text-gray-500 mt-3 max-w-sm mx-auto">
                  Thanks for applying, <strong>{allData.full_name}</strong>! Our team will review and contact you within 48 hours.
                </p>
                <div className="mt-8">
                  <a href="/" className="inline-flex items-center px-8 py-3 bg-primary text-white font-semibold rounded-2xl btn-3d">
                    Back to Home
                  </a>
                </div>
              </motion.div>
            ) : (
              <motion.div key={step}
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="bg-white rounded-[28px] shadow-xl p-8 sm:p-10">


                <div className="mb-8">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Step {step + 1} of 4</span>
                  <h2 className="text-2xl font-bold text-navy mt-1">{stepInfo[step].label}</h2>
                  <p className="text-sm text-gray-500 mt-1">{stepInfo[step].subtitle}</p>
                </div>

                {/* ── Step 1: Personal Info ── */}
                {step === 0 && (
                  <form onSubmit={handleSubmit(onNext)} className="space-y-5">
                    <Field label="Full Name" required error={errors.full_name?.message} {...register('full_name')} />
                    <Field label="Email Address" required type="email" error={errors.email?.message} {...register('email')} />
                    <Field label="Date of Birth" required type="date"
                      max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      error={errors.date_of_birth?.message} {...register('date_of_birth')} />
                    <p className="text-xs text-gray-400 pl-1">You must be 18 years or older to apply.</p>
                    <div className="flex justify-end pt-2">
                      <Button type="submit" variant="primary" size="md">
                        Next <ChevronRight size={18} className="ml-1" />
                      </Button>
                    </div>
                  </form>
                )}

                {/* ── Step 2: ID Verification ── */}
                {step === 1 && (
                  <form onSubmit={handleSubmit(onNext)} className="space-y-5">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-sm text-blue-700 flex gap-2">
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                      <span>You'll need to carry your original ID document on your first day.</span>
                    </div>
                    <SelectField label="ID Document Type" required
                      options={idTypes} error={errors.id_type?.message} {...register('id_type')} />
                    <Field label="ID Number" required
                      placeholder={getIdPlaceholder()}
                      error={errors.id_number?.message} {...register('id_number')} />

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Upload {selectedIdType || 'ID'} Proof *</label>
                      <label className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all hover:bg-gray-50
                        ${idProofFile ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${idProofFile ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                          {idProofFile ? <Check size={20} /> : <Upload size={20} />}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{fileName || 'Click to upload or drag & drop'}</span>
                        <span className="text-xs text-gray-400 mt-1">PNG, JPG, or PDF (Max 10MB)</span>
                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" required
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null
                            setIdProofFile(file)
                            setFileName(file?.name || '')
                          }} />
                      </label>
                      {idProofFile && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 rounded-lg text-xs text-gray-500">
                          <FileText size={14} />
                          <span className="truncate">{fileName}</span>
                          <span className="ml-auto">{(idProofFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between pt-2">
                      <Button type="button" variant="ghost" size="md" onClick={onBack}>
                        <ChevronLeft size={18} className="mr-1" /> Back
                      </Button>
                      <Button type="submit" variant="primary" size="md">
                        Next <ChevronRight size={18} className="ml-1" />
                      </Button>
                    </div>
                  </form>
                )}

                {/* ── Step 3: Location & Vehicle ── */}
                {step === 2 && (
                  <form onSubmit={handleSubmit(onNext)} className="space-y-5">
                    <Controller name="mobile" control={control}
                      render={({ field }) => (
                        <FloatingPhoneInput value={field.value} onChange={field.onChange} error={errors.mobile?.message} />
                      )} />
                    <Field label="City" required placeholder="e.g. Bangalore"
                      error={errors.city?.message} {...register('city')} />
                    <SelectField label="Vehicle Type" required
                      options={vehicleOptions} error={errors.vehicle_type?.message} {...register('vehicle_type')} />
                    <div className="flex justify-between pt-2">
                      <Button type="button" variant="ghost" size="md" onClick={onBack}>
                        <ChevronLeft size={18} className="mr-1" /> Back
                      </Button>
                      <Button type="submit" variant="primary" size="md">
                        Next <ChevronRight size={18} className="ml-1" />
                      </Button>
                    </div>
                  </form>
                )}

                {/* ── Step 4: Eligibility confirmation + Review ── */}
                {step === 3 && (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="glass-card p-5 rounded-2xl space-y-0.5">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Application Summary</p>
                      <ReviewRow label="Name"     value={allData.full_name} />
                      <ReviewRow label="Email"    value={allData.email} />
                      <ReviewRow label="DOB"      value={allData.date_of_birth} />
                      <ReviewRow label="ID Type"  value={allData.id_type} />
                      <ReviewRow label="ID No."   value={allData.id_number} />
                      <ReviewRow label="Mobile"   value={allData.mobile} />
                      <ReviewRow label="City"     value={allData.city} />
                      <ReviewRow label="Vehicle"  value={allData.vehicle_type} />
                    </div>

                    {/* Eligibility confirmations */}
                    <div>
                      <p className="text-sm font-semibold text-navy mb-3">Please confirm all eligibility criteria:</p>
                      <div className="space-y-3">
                        <CheckRow checked={hasSmartphone} onChange={setHasSmartphone}>
                          I own a <strong>smartphone with internet access</strong> to use the NatooKart partner app.
                        </CheckRow>
                        <CheckRow checked={flexibleHours} onChange={setFlexibleHours}>
                          I am willing to work <strong>flexible hours</strong> as required for deliveries.
                        </CheckRow>
                        <CheckRow checked={cleanRecord} onChange={setCleanRecord}>
                          I have a <strong>clean driving record</strong> for motorised vehicles (if applicable).
                        </CheckRow>
                      </div>
                    </div>

                    {/* Declaration */}
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="custom-checkbox mt-0.5" required id="partner-declaration" />
                      <span className="text-sm text-gray-600 leading-relaxed">
                        I confirm all the information above is accurate and I agree to the{' '}
                        <a href="#" className="text-primary font-medium hover:underline">Terms & Conditions</a>.
                      </span>
                    </label>

                    {formError && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex gap-2">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" /> {formError}
                      </div>
                    )}

                    <div className="flex justify-between pt-2">
                      <Button type="button" variant="ghost" size="md" onClick={onBack}>
                        <ChevronLeft size={18} className="mr-1" /> Back
                      </Button>
                      <Button type="button" variant="primary" size="lg" onClick={onFinalSubmit} disabled={submitting}>
                        {submitting ? 'Submitting…' : 'Submit Application'}
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  )
}
