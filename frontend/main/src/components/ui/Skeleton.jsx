/**
 * Skeleton.jsx — Reusable skeleton loading components (main frontend)
 */

export function SkeletonBlock({ className = '' }) {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:400%_100%] animate-shimmer rounded-lg ${className}`} />
  )
}

export function SkeletonText({ className = '', width = 'w-full' }) {
  return <SkeletonBlock className={`h-4 rounded-md ${width} ${className}`} />
}

export function SkeletonImage({ className = 'w-full h-48' }) {
  return (
    <div className={`relative overflow-hidden bg-gray-100 rounded-2xl ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer bg-[length:400%_100%]" />
    </div>
  )
}

// Product card skeleton
export function SkeletonProductCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <SkeletonImage className="w-full h-44" />
      <div className="p-4 space-y-3">
        <SkeletonText width="w-3/4" />
        <SkeletonText width="w-1/2" className="h-3" />
        <div className="flex justify-between items-center pt-1">
          <SkeletonText width="w-16" className="h-5" />
          <SkeletonBlock className="w-20 h-8 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// Hero section skeleton
export function SkeletonHero() {
  return (
    <div className="space-y-5 py-8">
      <SkeletonBlock className="w-32 h-7 rounded-full mx-auto" />
      <SkeletonText width="w-2/3 mx-auto" className="h-10" />
      <SkeletonText width="w-1/2 mx-auto" className="h-10" />
      <SkeletonText width="w-3/4 mx-auto" />
      <SkeletonText width="w-2/3 mx-auto" />
      <div className="flex gap-3 justify-center pt-2">
        <SkeletonBlock className="w-32 h-12 rounded-2xl" />
        <SkeletonBlock className="w-32 h-12 rounded-2xl" />
      </div>
    </div>
  )
}

// Benefit/feature card skeleton
export function SkeletonFeatureCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <SkeletonBlock className="w-12 h-12 rounded-2xl" />
      <SkeletonText width="w-40" className="h-5" />
      <SkeletonText />
      <SkeletonText width="w-3/4" />
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
          <SkeletonBlock className="w-full h-12 rounded-xl" />
        </div>
      ))}
      <SkeletonBlock className="w-full h-12 rounded-2xl mt-2" />
    </div>
  )
}

// Submission in-progress skeleton — replaces form card while API call is pending
export function SubmittingSkeleton({ label = 'Submitting your application…' }) {
  return (
    <div className="bg-white rounded-[28px] shadow-xl p-10 sm:p-14 flex flex-col items-center justify-center gap-6 min-h-[360px]">
      {/* Animated logo ring */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
        <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-secondary opacity-60 animate-pulse" />
        </div>
      </div>

      {/* Status text */}
      <div className="text-center space-y-2">
        <p className="text-base font-semibold text-navy">{label}</p>
        <p className="text-sm text-gray-400">Please don't close this page</p>
      </div>

      {/* Skeleton preview of "data being sent" */}
      <div className="w-full max-w-xs space-y-3 pt-2">
        {[
          { w: 'w-full', label: 'Uploading documents' },
          { w: 'w-5/6',  label: 'Verifying details' },
          { w: 'w-3/4',  label: 'Sending confirmation' },
        ].map(({ w, label: stepLabel }, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
              i === 0
                ? 'bg-primary animate-pulse'
                : 'bg-gray-200 animate-pulse'
            }`} style={{ animationDelay: `${i * 0.4}s` }} />
            <div className="flex-1 space-y-1">
              <p className="text-xs text-gray-500">{stepLabel}</p>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r from-primary to-secondary animate-shimmer bg-[length:400%_100%] ${
                    i === 0 ? 'w-3/4' : i === 1 ? 'w-1/3' : 'w-0'
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

