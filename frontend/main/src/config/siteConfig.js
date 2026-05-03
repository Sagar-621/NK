// ============================================================
// Site Configuration — Single source of truth
// ============================================================

// Set to true to show full-screen maintenance overlay
// Set to 'partial' to show amber warning banner only
export const MAINTENANCE_MODE = false // true | false | 'partial'

// Countdown target for full maintenance mode (ISO string)
export const MAINTENANCE_END = '2026-05-03T18:00:00+05:30'

// Maintenance messages
export const MAINTENANCE_TITLE = 'We\'ll be back soon!'
export const MAINTENANCE_MESSAGE = 'We\'re performing scheduled maintenance to improve your experience. Thank you for your patience.'
export const PARTIAL_MAINTENANCE_MESSAGE = 'Some features may be temporarily unavailable. We\'re working on it!'

// Brand
export const BRAND_NAME = 'NatooKart'
export const BRAND_TAGLINE = 'India\'s Local Shopping App — fresh groceries delivered to your doorstep in minutes.'
export const SUPPORT_EMAIL = 'hello@natookart.com'
export const SUPPORT_PHONE = '+91 98765 43210'

// Feature flags
// TODO: Replace with remote config (Firebase Remote Config / LaunchDarkly)
export const FEATURES = {
  enableCareersPage: true,
  enableMerchantSignup: true,
  enablePartnerSignup: true,
  enableContactForm: true,
}
