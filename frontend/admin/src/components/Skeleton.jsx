/**
 * Skeleton.jsx — Reusable skeleton loading components
 * Used across both admin and main frontends
 */

// Base pulse block
export function SkeletonBlock({ className = '' }) {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:400%_100%] animate-shimmer rounded-lg ${className}`} />
  )
}

// Text line
export function SkeletonText({ className = '', width = 'w-full' }) {
  return <SkeletonBlock className={`h-4 rounded-md ${width} ${className}`} />
}

// Avatar / Icon circle
export function SkeletonAvatar({ size = 'md' }) {
  const sizes = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' }
  return <SkeletonBlock className={`${sizes[size]} rounded-2xl flex-shrink-0`} />
}

// Stat card skeleton (Dashboard)
export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <SkeletonBlock className="w-11 h-11 rounded-xl" />
      </div>
      <SkeletonText className="mt-4" width="w-16" />
      <SkeletonText width="w-32" />
      <SkeletonText width="w-24" />
    </div>
  )
}

// Table row skeleton
export function SkeletonTableRow({ cols = 7 }) {
  const widths = ['w-8', 'w-32', 'w-28', 'w-20', 'w-16', 'w-16', 'w-20']
  return (
    <tr className="border-b border-gray-50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <SkeletonText width={widths[i] || 'w-20'} />
        </td>
      ))}
    </tr>
  )
}

// Full table skeleton
export function SkeletonTable({ rows = 5, cols = 7, headers = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {headers.map((h, i) => (
                <th key={i} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <SkeletonTableRow key={i} cols={cols} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Activity row skeleton
export function SkeletonActivityRow() {
  return (
    <div className="flex items-center gap-3 p-3">
      <SkeletonBlock className="w-6 h-6 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonText width="w-3/4" />
        <SkeletonText width="w-1/4" className="h-3" />
      </div>
      <SkeletonText width="w-12" className="h-3" />
    </div>
  )
}

// Side panel / slide-over skeleton
export function SkeletonSidePanel() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <SkeletonAvatar size="lg" />
        <div className="space-y-2 flex-1">
          <SkeletonText width="w-40" />
          <SkeletonText width="w-20" className="h-5" />
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex justify-between py-2 border-b border-gray-50">
          <SkeletonText width="w-20" />
          <SkeletonText width="w-32" />
        </div>
      ))}
    </div>
  )
}

// Card skeleton (merchant / partner card)
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <SkeletonText width="w-40" />
          <SkeletonText width="w-24" className="h-3" />
        </div>
        <SkeletonBlock className="w-16 h-6 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SkeletonText className="h-3" />
        <SkeletonText className="h-3" />
        <SkeletonText className="h-3" />
        <SkeletonText className="h-3" />
      </div>
      <div className="flex gap-2 pt-1">
        <SkeletonBlock className="w-8 h-8 rounded-lg" />
        <SkeletonBlock className="w-8 h-8 rounded-lg" />
        <SkeletonBlock className="w-8 h-8 rounded-lg" />
      </div>
    </div>
  )
}

// Image skeleton
export function SkeletonImage({ className = 'w-full h-48' }) {
  return (
    <div className={`relative overflow-hidden bg-gray-100 rounded-2xl ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer bg-[length:400%_100%]" />
    </div>
  )
}

// Form skeleton
export function SkeletonForm({ fields = 4 }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonText width="w-24" className="h-3" />
          <SkeletonBlock className="w-full h-11 rounded-xl" />
        </div>
      ))}
      <SkeletonBlock className="w-full h-11 rounded-xl mt-2" />
    </div>
  )
}

// Inquiry message skeleton
export function SkeletonInquiryItem() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 flex-1">
          <SkeletonText width="w-32" />
          <SkeletonText width="w-48" className="h-3" />
        </div>
        <SkeletonBlock className="w-14 h-5 rounded-md" />
      </div>
      <SkeletonText className="h-3" />
      <SkeletonText width="w-3/4" className="h-3" />
      <SkeletonText width="w-20" className="h-2.5" />
    </div>
  )
}

// Dashboard page skeleton
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <SkeletonText width="w-64" className="h-7" />
        <SkeletonText width="w-80" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <SkeletonText width="w-36" className="h-5 mb-4" />
          {Array.from({ length: 5 }).map((_, i) => <SkeletonActivityRow key={i} />)}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <SkeletonText width="w-32" className="h-5 mb-4" />
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="w-full h-12 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
