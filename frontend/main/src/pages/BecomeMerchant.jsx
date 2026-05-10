import { useState, useMemo, useEffect, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, ChevronLeft, ChevronRight, Upload, Store, User, MapPin, FileCheck } from 'lucide-react'
import Button from '../components/ui/Button'
import { SubmittingSkeleton } from '../components/ui/Skeleton'

// ===== VALIDATION SCHEMAS =====
const step1Schema = z.object({
  storeName: z.string().min(2, 'Store name is required'),
  businessType: z.string().min(1, 'Select a business type'),
  gstin: z.string().min(15, 'Enter a valid 15-digit GSTIN').max(15),
  pan: z.string().min(10, 'Enter a valid 10-character PAN').max(10),
  yearsInBusiness: z.string().min(1, 'Required'),
})

const step2Schema = z.object({
  ownerName: z.string().min(2, 'Owner name is required'),
  mobile: z.string().min(8, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email'),
})

const step3Schema = z.object({
  address1: z.string().min(5, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pin: z.string().min(6, 'Enter a valid 6-digit PIN').max(6),
  operatingHours: z.string().min(1, 'Required'),
})

const schemas = [step1Schema, step2Schema, step3Schema]

const stepInfo = [
  { label: 'Business Details', icon: Store, subtitle: 'Tell us about your store' },
  { label: 'Seller Details', icon: User, subtitle: 'Your personal information' },
  { label: 'Shipping Location', icon: MapPin, subtitle: 'Where do you operate?' },
  { label: 'Review & Submit', icon: FileCheck, subtitle: 'Verify your information' },
]

const businessTypes = ['Grocery Store', 'Supermarket', 'Pharmacy', 'Bakery', 'Dairy & Milk', 'Fruits & Vegetables', 'Meat & Fish', 'Other']


// ===== CONFETTI COMPONENT =====
function Confetti() {
  const pieces = useMemo(() => {
    const colors = ['#7C1130', '#16A34A', '#F9D4DC', '#F0FDF4', '#F59E0B', '#3B82F6']
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.5}s`,
      size: Math.random() * 6 + 4,
      rotation: Math.random() * 360,
    }))
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            bottom: '40%',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: p.delay,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}

// ===== SUCCESS CHECKMARK =====
function SuccessCheckmark() {
  return (
    <svg width="80" height="80" viewBox="0 0 52 52" className="mx-auto mb-6">
      <circle cx="26" cy="26" r="25" fill="none" stroke="#16A34A" strokeWidth="2" className="checkmark-circle" />
      <path fill="none" stroke="#7C1130" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M14.1 27.2l7.1 7.2 16.7-16.8" className="checkmark-check" />
    </svg>
  )
}

// ===== FLOATING INPUT =====
const FloatingInput = forwardRef(({ label, error, type = 'text', ...props }, ref) => {
  return (
    <div className="space-y-1">
      <div className="floating-label-group">
        <input
          ref={ref}
          type={type}
          placeholder=" "
          className={error ? 'error' : ''}
          {...props}
        />
        <label>{label}</label>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-xs pl-1 animate-shake"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
})

const FloatingSelect = forwardRef(({ label, error, options, ...props }, ref) => {
  return (
    <div className="space-y-1">
      <div className="floating-label-group">
        <select ref={ref} className={`appearance-none ${error ? 'error' : ''}`} {...props}>
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <label className="!top-[-0.5rem] !text-xs !font-semibold !text-primary">{label}</label>
      </div>
      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs pl-1">
          {error}
        </motion.p>
      )}
    </div>
  )
})

// Country codes list — flag emoji + dial code + max local digits
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
  { flag: '🇷🇺', name: 'Russia',       dial: '+7',   max: 10 },
  { flag: '🇧🇷', name: 'Brazil',       dial: '+55',  max: 11 },
  { flag: '🇿🇦', name: 'South Africa', dial: '+27',  max: 9  },
  { flag: '🇰🇷', name: 'South Korea',  dial: '+82',  max: 10 },
  { flag: '🇲🇽', name: 'Mexico',       dial: '+52',  max: 10 },
  { flag: '🇮🇩', name: 'Indonesia',    dial: '+62',  max: 12 },
  { flag: '🇵🇰', name: 'Pakistan',     dial: '+92',  max: 10 },
  { flag: '🇧🇩', name: 'Bangladesh',   dial: '+880', max: 10 },
  { flag: '🇵🇭', name: 'Philippines',  dial: '+63',  max: 10 },
  { flag: '🇹🇷', name: 'Turkey',       dial: '+90',  max: 10 },
  { flag: '🇪🇬', name: 'Egypt',        dial: '+20',  max: 10 },
  { flag: '🇳🇬', name: 'Nigeria',      dial: '+234', max: 10 },
  { flag: '🇰🇪', name: 'Kenya',        dial: '+254', max: 9  },
  { flag: '🇲🇦', name: 'Morocco',      dial: '+212', max: 9  },
]

const FloatingPhoneInput = ({ value, onChange, error, label = 'Mobile Number' }) => {
  const [country, setCountry] = useState(COUNTRY_CODES[0])
  const [digits, setDigits] = useState('')

  useEffect(() => {
    if (!value) {
      setCountry(COUNTRY_CODES[0])
      setDigits('')
      return
    }

    const matchedCountry = COUNTRY_CODES.find((c) => value.startsWith(c.dial)) || COUNTRY_CODES[0]
    const dialDigits = matchedCountry.dial.replace(/\D/g, '').length
    const rawDigits = value.replace(/\D/g, '')
    const nextDigits = rawDigits.slice(dialDigits, dialDigits + matchedCountry.max)

    setCountry(matchedCountry)
    setDigits(nextDigits)
  }, [value])

  const handleCountryChange = (e) => {
    const selected = COUNTRY_CODES.find(c => `${c.dial}_${c.name}` === e.target.value)
    if (selected) {
      setCountry(selected)
      const newVal = digits ? `${selected.dial}${digits}` : ''
      if (onChange) onChange(newVal)
    }
  }

  const handleDigitsChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, country.max)
    setDigits(raw)
    if (onChange) onChange(raw ? `${country.dial}${raw}` : '')
  }

  return (
    <div className="space-y-1">
      <div className={`flex items-stretch border-2 rounded-xl overflow-hidden transition-colors ${
        error ? 'border-red-400' : 'border-gray-100 focus-within:border-primary'
      }`}>
        {/* Country selector */}
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
        {/* Number input */}
        <div className="relative flex-1">
          <input
            type="tel"
            inputMode="numeric"
            value={digits}
            onChange={handleDigitsChange}
            maxLength={country.max}
            placeholder={`${country.max} digits`}
            className="w-full h-full px-3 py-3.5 outline-none text-sm bg-white"
          />
        </div>
      </div>
      <p className="text-xs text-gray-400 pl-1">
        {country.flag} {country.dial} — max {country.max} digits
      </p>
      {error && <p className="text-red-500 text-xs pl-1">{error}</p>}
    </div>
  )
}

// ===== MAIN COMPONENT =====
export default function BecomeMerchant() {
  const [currentStep, setCurrentStep] = useState(0)
  const [allData, setAllData] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fileName, setFileName] = useState('')
  const [idProofFile, setIdProofFile] = useState(null)
  const [idProofPreview, setIdProofPreview] = useState('')
  const [formError, setFormError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    resolver: currentStep < 3 ? zodResolver(schemas[currentStep]) : undefined,
    mode: 'onChange',
  })

  useEffect(() => {
    if (currentStep < 3) {
      reset(allData)
    }
  }, [allData, currentStep, reset])

  useEffect(() => {
    if (!idProofFile) {
      setIdProofPreview('')
      return
    }

    const objectUrl = URL.createObjectURL(idProofFile)
    setIdProofPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [idProofFile])

  const onNext = (data) => {
    const merged = { ...allData, ...data }
    setAllData(merged)
    reset(merged)

    if (currentStep < 3) {
      setCurrentStep((s) => s + 1)
    }
  }

  const onBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
    }
  }

  const onFinalSubmit = async () => {
    setIsSubmitting(true)
    setFormError('')
    try {
      const hours = allData.operatingHours || '8 AM – 8 PM'
      const [openFrom, openTo] = hours.includes('24') ? ['00:00', '23:59'] : (() => {
        const parts = hours.split('–').map(s => s.trim())
        const to24 = (t) => { const [h, period] = t.split(' '); let hr = parseInt(h); if (period === 'PM' && hr !== 12) hr += 12; if (period === 'AM' && hr === 12) hr = 0; return `${String(hr).padStart(2,'0')}:00` }
        return [to24(parts[0] || '8 AM'), to24(parts[1] || '8 PM')]
      })()

      const formData = new FormData()
      formData.append('store_name', allData.storeName || '')
      formData.append('business_type', allData.businessType || '')
      formData.append('gstin', allData.gstin || '')
      formData.append('pan', allData.pan || '')
      formData.append('years_in_biz', allData.yearsInBusiness || '')
      formData.append('owner_name', allData.ownerName || '')
      formData.append('mobile', allData.mobile || '')
      formData.append('email', allData.email || '')
      formData.append('address_line1', allData.address1 || '')
      formData.append('address_line2', allData.address2 || '')
      formData.append('city', allData.city || '')
      formData.append('state', allData.state || '')
      formData.append('pin_code', allData.pin || '')
      formData.append('open_from', openFrom)
      formData.append('open_to', openTo)
      formData.append('status', 'pending')
      formData.append('operating_hours', hours)
      if (idProofFile) formData.append('id_proof', idProofFile)

      const res = await fetch('/api/merchants', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to submit')
      }
      setIsSubmitted(true)
    } catch (err) {
      console.error('Merchant form error:', err)
      setFormError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const goToStep = (step) => {
    if (step < currentStep) {
      setCurrentStep(step)
    }
  }

  const progressPercent = (currentStep / 3) * 100

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary to-primary-dark text-white pt-32 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          >
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Become a Merchant</h1>
            <p className="text-lg text-white/80 mt-6 leading-relaxed">
              Partner with NatooKart and reach thousands of customers in your area. Start selling today.
            </p>
          </motion.div>
        </div>
        <div className="wave-divider">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
            <path d="M0,0 C480,60 960,60 1440,0 L1440,60 L0,60 Z" fill="#F8FAFC" />
          </svg>
        </div>
      </section>

      {/* Form */}
      <section className="py-20 bg-[#F8FAFC] min-h-[80vh]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Progress Bar — hidden while submitting or after success */}
          {!isSubmitted && !isSubmitting && (
            <div className="mb-12">
              <div className="relative flex items-center justify-between">
                {/* Background line */}
                <div className="step-progress-line left-0 right-0">
                  <div className="step-progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>

                {stepInfo.map((step, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center">
                    <button
                      onClick={() => goToStep(i)}
                      disabled={i > currentStep}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                        i < currentStep
                          ? 'bg-primary text-white shadow-lg shadow-primary/30'
                          : i === currentStep
                          ? 'bg-white text-primary ring-2 ring-primary shadow-lg'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {i < currentStep ? <Check size={18} /> : i + 1}
                    </button>
                    <span className={`text-[10px] sm:text-xs font-medium mt-2 text-center leading-tight ${
                      i <= currentStep ? 'text-primary' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Card */}
          <AnimatePresence mode="wait">
            {isSubmitting ? (
              <motion.div
                key="submitting"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
              >
                <SubmittingSkeleton label="Submitting your merchant application…" />
              </motion.div>
            ) : isSubmitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[28px] shadow-xl p-10 sm:p-14 text-center relative overflow-hidden"
              >
                <Confetti />
                <SuccessCheckmark />
                <h2 className="text-2xl font-bold text-navy">Application Submitted!</h2>
                <p className="text-gray-500 mt-3 max-w-sm mx-auto">
                  Thank you for your interest. Our team will review your application and reach out within 2–3 business days.
                </p>
                <div className="mt-8">
                  <a href="/" className="inline-flex items-center px-8 py-3 bg-primary text-white font-semibold rounded-2xl btn-3d">
                    Back to Home
                  </a>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="bg-white rounded-[28px] shadow-xl p-8 sm:p-10"
              >
                {/* Step header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    {(() => {
                      const Icon = stepInfo[currentStep].icon
                      return <Icon size={22} className="text-primary" />
                    })()}
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      Step {currentStep + 1} of 4
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-navy">{stepInfo[currentStep].label}</h2>
                  <p className="text-sm text-gray-500 mt-1">{stepInfo[currentStep].subtitle}</p>
                </div>

                {/* STEP 1 — Business Details */}
                {currentStep === 0 && (
                  <form onSubmit={handleSubmit(onNext)} className="space-y-5">
                    <FloatingInput label="Store Name" error={errors.storeName?.message} {...register('storeName')} />
                    <FloatingSelect label="Business Type" options={businessTypes} error={errors.businessType?.message} {...register('businessType')} />
                    <div className="grid sm:grid-cols-2 gap-5">
                      <FloatingInput label="GSTIN" error={errors.gstin?.message} {...register('gstin')} />
                      <FloatingInput label="PAN Number" error={errors.pan?.message} {...register('pan')} />
                    </div>
                    <FloatingSelect label="Years in Business" options={['Less than 1 year', '1–3 years', '3–5 years', '5–10 years', '10+ years']} error={errors.yearsInBusiness?.message} {...register('yearsInBusiness')} />

                    <div className="flex justify-end pt-4">
                      <Button type="submit" variant="primary" size="md">
                        Next <ChevronRight size={18} className="ml-1" />
                      </Button>
                    </div>
                  </form>
                )}

                {/* STEP 2 — Seller Details */}
                {currentStep === 1 && (
                  <form onSubmit={handleSubmit(onNext)} className="space-y-5">
                    <FloatingInput label="Owner Full Name" error={errors.ownerName?.message} {...register('ownerName')} />
                    
                    <Controller
                      name="mobile"
                      control={control}
                      render={({ field }) => (
                        <FloatingPhoneInput
                          label="Mobile Number"
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.mobile?.message}
                        />
                      )}
                    />

                    <FloatingInput label="Email Address" type="email" error={errors.email?.message} {...register('email')} />
                    {/* File Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ID Proof Upload</label>
                      <label className="drag-zone flex flex-col items-center gap-2 cursor-pointer">
                        <Upload size={28} className="text-gray-400" />
                        <span className="text-sm text-gray-500">{fileName || 'Drag & drop or click to upload'}</span>
                        <span className="text-xs text-gray-400">Aadhaar, PAN, or Passport (PDF, JPG, PNG)</span>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null
                            setIdProofFile(file)
                            setFileName(file?.name || '')
                          }}
                        />
                      </label>
                      {idProofPreview && idProofFile?.type?.startsWith('image/') && (
                        <div className="mt-3 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                          <img src={idProofPreview} alt="Selected ID proof preview" className="w-full max-h-48 object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button type="button" variant="ghost" size="md" onClick={onBack}>
                        <ChevronLeft size={18} className="mr-1" /> Back
                      </Button>
                      <Button type="submit" variant="primary" size="md">
                        Next <ChevronRight size={18} className="ml-1" />
                      </Button>
                    </div>
                  </form>
                )}

                {/* STEP 3 — Shipping Location */}
                {currentStep === 2 && (
                  <form onSubmit={handleSubmit(onNext)} className="space-y-5">
                    <FloatingInput label="Address Line 1" error={errors.address1?.message} {...register('address1')} />
                    <FloatingInput label="Address Line 2 (Optional)" {...register('address2')} />
                    <div className="grid sm:grid-cols-3 gap-5">
                      <FloatingInput label="City" error={errors.city?.message} {...register('city')} />
                      <FloatingInput label="State" error={errors.state?.message} {...register('state')} />
                      <FloatingInput label="PIN Code" error={errors.pin?.message} {...register('pin')} />
                    </div>
                    <FloatingSelect label="Operating Hours" options={['6 AM – 10 PM', '8 AM – 8 PM', '9 AM – 9 PM', '24 Hours']} error={errors.operatingHours?.message} {...register('operatingHours')} />

                    <div className="flex justify-between pt-4">
                      <Button type="button" variant="ghost" size="md" onClick={onBack}>
                        <ChevronLeft size={18} className="mr-1" /> Back
                      </Button>
                      <Button type="submit" variant="primary" size="md">
                        Next <ChevronRight size={18} className="ml-1" />
                      </Button>
                    </div>
                  </form>
                )}

                {/* STEP 4 — Review */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    {/* Business Summary */}
                    <div className="glass-card p-5 rounded-2xl">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold text-navy">Business Details</h3>
                        <button onClick={() => goToStep(0)} className="text-xs text-primary font-semibold hover:underline">Edit</button>
                      </div>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                        <span className="text-gray-400">Store</span><span className="text-navy font-medium">{allData.storeName || '—'}</span>
                        <span className="text-gray-400">Type</span><span className="text-navy font-medium">{allData.businessType || '—'}</span>
                        <span className="text-gray-400">GSTIN</span><span className="text-navy font-medium">{allData.gstin || '—'}</span>
                        <span className="text-gray-400">PAN</span><span className="text-navy font-medium">{allData.pan || '—'}</span>
                      </div>
                    </div>

                    {/* Seller Summary */}
                    <div className="glass-card p-5 rounded-2xl">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold text-navy">Seller Details</h3>
                        <button onClick={() => goToStep(1)} className="text-xs text-primary font-semibold hover:underline">Edit</button>
                      </div>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                        <span className="text-gray-400">Name</span><span className="text-navy font-medium">{allData.ownerName || '—'}</span>
                        <span className="text-gray-400">Mobile</span><span className="text-navy font-medium">{allData.mobile || '—'}</span>
                        <span className="text-gray-400">Email</span><span className="text-navy font-medium">{allData.email || '—'}</span>
                      </div>
                    </div>

                    {/* Shipping Summary */}
                    <div className="glass-card p-5 rounded-2xl">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold text-navy">Shipping Location</h3>
                        <button onClick={() => goToStep(2)} className="text-xs text-primary font-semibold hover:underline">Edit</button>
                      </div>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                        <span className="text-gray-400">Address</span><span className="text-navy font-medium">{allData.address1 || '—'}</span>
                        <span className="text-gray-400">City</span><span className="text-navy font-medium">{allData.city || '—'}</span>
                        <span className="text-gray-400">State</span><span className="text-navy font-medium">{allData.state || '—'}</span>
                        <span className="text-gray-400">PIN</span><span className="text-navy font-medium">{allData.pin || '—'}</span>
                      </div>
                    </div>

                    {/* Declaration */}
                    <div className="flex flex-col gap-4">
                      {formError && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium"
                        >
                          ⚠️ {formError}
                        </motion.div>
                      )}

                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="pt-0.5">
                          <input type="checkbox" className="custom-checkbox" id="declaration-checkbox" required />
                        </div>
                        <span className="text-sm text-gray-600 leading-relaxed">
                          I declare that all the information provided above is accurate and I agree to the{' '}
                          <a href="#" className="text-primary font-medium hover:underline">Terms & Conditions</a>{' '}
                          and <a href="#" className="text-primary font-medium hover:underline">Merchant Agreement</a>.
                        </span>
                      </label>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button type="button" variant="ghost" size="md" onClick={onBack}>
                        <ChevronLeft size={18} className="mr-1" /> Back
                      </Button>
                      <Button type="button" variant="primary" size="lg" onClick={onFinalSubmit} disabled={isSubmitting}>
                        Submit Application
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
