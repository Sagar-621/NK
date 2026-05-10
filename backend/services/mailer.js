const nodemailer = require('nodemailer')
const db = require('../db')

let mailerRuntimeOverrides = {
  supportEmail: '',
  user: '',
  appPassword: '',
}

let adminMailerColumnsReady = false

async function ensureAdminMailerColumns() {
  if (adminMailerColumnsReady) return

  const columns = [
    ['support_email', 'VARCHAR(255) NULL'],
    ['smtp_app_password', 'VARCHAR(255) NULL'],
    ['is_active', 'BOOLEAN NOT NULL DEFAULT TRUE'],
  ]

  for (const [name, definition] of columns) {
    const [rows] = await db.execute(
      `SELECT COLUMN_NAME
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'admins'
         AND COLUMN_NAME = ?`,
      [name]
    )

    if (!rows.length) {
      await db.execute(`ALTER TABLE admins ADD COLUMN ${name} ${definition}`)
    }
  }

  adminMailerColumnsReady = true
}

async function getActiveAdminMailerCredentials() {
  await ensureAdminMailerColumns()

  const [rows] = await db.execute(
    `SELECT support_email, smtp_app_password
     FROM admins
     WHERE is_active = TRUE
     ORDER BY id ASC
     LIMIT 1`
  )

  const admin = rows[0] || {}
  return {
    supportEmail: String(admin.support_email || '').trim(),
    appPassword: String(admin.smtp_app_password || '').replace(/\s+/g, '').trim(),
  }
}

async function bootstrapMailerRuntimeConfig() {
  try {
    const credentials = await getActiveAdminMailerCredentials()
    if (credentials.supportEmail || credentials.appPassword) {
      setMailerRuntimeConfig(credentials)
    }
  } catch (err) {
    console.error('[MAIL] Failed to bootstrap runtime config:', err.message)
  }
}

function setMailerRuntimeConfig(overrides = {}) {
  mailerRuntimeOverrides = {
    supportEmail: String(overrides.supportEmail || '').trim(),
    user: String(overrides.user || overrides.supportEmail || '').trim(),
    appPassword: String(overrides.appPassword || '').replace(/\s+/g, '').trim(),
  }
}

function getMailConfig() {
  const runtimeSupportEmail = mailerRuntimeOverrides.supportEmail || ''
  const runtimeUser = mailerRuntimeOverrides.user || ''
  const runtimeAppPassword = mailerRuntimeOverrides.appPassword || ''
  return {
    user: runtimeUser || String(process.env.SMTP_USER || process.env.SUPPORT_EMAIL || '').trim(),
    appPassword: runtimeAppPassword || String(process.env.SMTP_APP_PASSWORD || '').replace(/\s+/g, '').trim(),
    fromName: String(process.env.SMTP_FROM_NAME || 'NatooKart').trim(),
    supportEmail: runtimeSupportEmail || String(process.env.SUPPORT_EMAIL || process.env.ADMIN_SUPPORT_EMAIL || process.env.SMTP_USER || '').trim(),
    frontendUrl: String(process.env.FRONTEND_URL || process.env.PUBLIC_SITE_URL || 'http://localhost:5173').trim(),
  }
}

function isMailerConfigured() {
  const { user, appPassword } = getMailConfig()
  const configured = Boolean(user && appPassword && user !== 'your_gmail@gmail.com' && appPassword !== 'your_gmail_app_password')
  if (!configured) {
    console.warn('[MAIL] Service not configured. Check SMTP_USER and SMTP_APP_PASSWORD in .env');
  }
  return configured
}

function createTransporter() {
  const { user, appPassword } = getMailConfig()
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass: appPassword },
  })
}

function buildShell({ title, intro, bodyHtml, footer = 'Sent automatically by NatooKart.' }) {
  const { frontendUrl } = getMailConfig()
  return `
    <div style="margin:0;padding:24px;background:#f7f7fb;font-family:Arial,sans-serif;color:#1f2937;">
      <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;">
        <div style="padding:24px 28px;background:linear-gradient(135deg,#7c1130 0%,#991b1b 100%);color:#fff;">
          <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;opacity:.85;">NatooKart</div>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.15;">${title}</h1>
          <p style="margin:12px 0 0;color:rgba(255,255,255,.9);line-height:1.7;">${intro}</p>
        </div>
        <div style="padding:24px 28px;">
          ${bodyHtml}
          <div style="margin-top:24px;padding-top:16px;border-top:1px solid #f1f5f9;color:#6b7280;font-size:12px;line-height:1.6;">
            ${footer}
          </div>
          <div style="margin-top:10px;font-size:12px;color:#9ca3af;">${frontendUrl}</div>
        </div>
      </div>
    </div>
  `
}

async function sendMail({ to, subject, text, html, replyTo }) {
  if (!to) {
    console.warn('[MAIL] No recipient specified, skipping.');
    return { skipped: true };
  }
  if (!isMailerConfigured()) {
    console.error(`[MAIL] Failed to send "${subject}" to ${to} — Mailer not configured.`);
    return { skipped: true };
  }

  const transporter = createTransporter()
  const { user, fromName } = getMailConfig()

  try {
    console.log(`[MAIL] Sending "${subject}" to ${to}...`);
    await transporter.sendMail({
      from: `"${fromName}" <${user}>`,
      to,
      replyTo: replyTo || undefined,
      subject,
      text,
      html,
    })
    console.log(`[MAIL] ✅ Successfully sent "${subject}" to ${to}`);
    return { success: true }
  } catch (err) {
    console.error(`[MAIL] ❌ Failed to send "${subject}" to ${to}:`, err.message);
    throw err;
  }
}

async function sendWelcomeEmail({ to, name, subject, intro, bodyLines = [], ctaLabel, ctaHref, footer }) {
  if (!to) return { skipped: true }

  const text = [intro, ...bodyLines].filter(Boolean).join('\n\n')
  const linesHtml = bodyLines.map((line) => `<p style="margin:0 0 10px;line-height:1.7;color:#374151;">${line}</p>`).join('')

  return sendMail({
    to,
    subject,
    text,
    html: buildShell({
      title: subject,
      intro,
      bodyHtml: `
        <p style="margin:0 0 16px;line-height:1.7;color:#374151;">Hi ${name || 'there'},</p>
        ${linesHtml}
        ${ctaLabel && ctaHref ? `<a href="${ctaHref}" style="display:inline-block;margin-top:12px;padding:12px 18px;border-radius:12px;background:#7c1130;color:#fff;text-decoration:none;font-weight:700;">${ctaLabel}</a>` : ''}
      `,
      footer,
    }),
  })
}

async function sendAdminNotification({ to, subject, intro, rows = [], replyTo, footer }) {
  if (!to) return { skipped: true }

  const rowsHtml = rows.map(([label, value]) => `
    <div style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #f3f4f6;">
      <span style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;font-weight:700;">${label}</span>
      <span style="font-size:14px;color:#111827;text-align:right;word-break:break-word;">${value || '—'}</span>
    </div>
  `).join('')

  const text = [intro, ...rows.map(([label, value]) => `${label}: ${value || '—'}`)].join('\n')

  return sendMail({
    to,
    replyTo,
    subject,
    text,
    html: buildShell({
      title: subject,
      intro,
      bodyHtml: `<div style="border:1px solid #e5e7eb;border-radius:16px;padding:0 16px;background:#fff;">${rowsHtml}</div>`,
      footer,
    }),
  })
}

async function sendMerchantWelcomeEmail({ to, storeName, ownerName }) {
  return sendWelcomeEmail({
    to,
    name: ownerName,
    subject: 'Welcome to NatooKart Merchant Onboarding',
    intro: `Thanks for submitting your merchant application for ${storeName || 'your store'}.`,
    bodyLines: [
      'Our team has received your details and will review your application shortly.',
      'You will get a follow-up once the review is complete.'
    ],
    ctaLabel: 'Visit NatooKart',
    ctaHref: getMailConfig().frontendUrl,
    footer: 'This is an automated confirmation of your merchant application.',
  })
}

async function sendPartnerWelcomeEmail({ to, fullName }) {
  return sendWelcomeEmail({
    to,
    name: fullName,
    subject: 'Delivery Partner Application Received',
    intro: 'Thanks for joining NatooKart as a delivery partner.',
    bodyLines: [
      'We have received your application and our team will review it soon.',
      'If approved, we will contact you with the next steps.'
    ],
    ctaLabel: 'Visit NatooKart',
    ctaHref: getMailConfig().frontendUrl,
    footer: 'This is an automated confirmation of your delivery partner application.',
  })
}

async function sendMerchantAdminNotification({ storeName, ownerName, email, mobile, city, status, proofUrl }) {
  const { supportEmail } = getMailConfig()
  return sendAdminNotification({
    to: supportEmail,
    subject: `New Merchant Application - ${storeName || 'NatooKart'}`,
    intro: 'A new merchant application was submitted and is ready for review.',
    rows: [
      ['Store', storeName],
      ['Owner', ownerName],
      ['Email', email],
      ['Mobile', mobile],
      ['City', city],
      ['Status', status || 'pending'],
      ['ID Proof', proofUrl ? 'Uploaded' : 'Not provided'],
    ],
    footer: 'Please review the merchant application from the admin dashboard.',
  })
}

async function sendPartnerAdminNotification({ fullName, email, mobile, city, vehicleType, status }) {
  const { supportEmail } = getMailConfig()
  return sendAdminNotification({
    to: supportEmail,
    subject: `New Delivery Partner Application - ${fullName || 'NatooKart'}`,
    intro: 'A new delivery partner application was submitted and is ready for review.',
    rows: [
      ['Name', fullName],
      ['Email', email || '—'],
      ['Mobile', mobile],
      ['City', city],
      ['Vehicle', vehicleType],
      ['Status', status || 'pending'],
    ],
    footer: 'Please review the delivery partner application from the admin dashboard.',
  })
}

async function sendMerchantDecisionEmail({ to, storeName, ownerName, status, note }) {
  const decision = String(status || '').trim().toLowerCase()
  const isApproved = decision === 'approved'
  const subject = isApproved
    ? `Your NatooKart merchant application has been approved`
    : `Update on your NatooKart merchant application`
  const intro = isApproved
    ? `Congratulations ${ownerName || 'there'} - your merchant application for ${storeName || 'your store'} has been approved.`
    : `Hi ${ownerName || 'there'}, we have reviewed your merchant application for ${storeName || 'your store'}.`

  return sendWelcomeEmail({
    to,
    name: ownerName,
    subject,
    intro,
    bodyLines: [
      isApproved
        ? 'You can now move forward with your onboarding and prepare your store for the next steps.'
        : 'At this time, your application was not approved.',
      note ? `Note from our team: ${note}` : (isApproved ? 'Our team will reach out if anything else is needed.' : 'You may reapply later with updated details.'),
    ],
    ctaLabel: 'Visit NatooKart',
    ctaHref: getMailConfig().frontendUrl,
    footer: 'This message was sent automatically after a merchant application review.',
  })
}

async function sendPartnerDecisionEmail({ to, fullName, status, note }) {
  const decision = String(status || '').trim().toLowerCase()
  const isApproved = decision === 'active' || decision === 'approved'
  const subject = isApproved
    ? `Your NatooKart delivery partner application has been approved`
    : `Update on your NatooKart delivery partner application`
  const intro = isApproved
    ? `Congratulations ${fullName || 'there'} - your delivery partner application has been approved.`
    : `Hi ${fullName || 'there'}, we have reviewed your delivery partner application.`

  return sendWelcomeEmail({
    to,
    name: fullName,
    subject,
    intro,
    bodyLines: [
      isApproved
        ? 'You can now proceed with the next onboarding steps and wait for your start instructions.'
        : 'At this time, your application was not approved.',
      note ? `Note from our team: ${note}` : (isApproved ? 'We will contact you if any onboarding step is needed.' : 'You may reapply later with updated details.'),
    ],
    ctaLabel: 'Visit NatooKart',
    ctaHref: getMailConfig().frontendUrl,
    footer: 'This message was sent automatically after a delivery partner application review.',
  })
}

module.exports = {
  getMailConfig,
  isMailerConfigured,
  setMailerRuntimeConfig,
  bootstrapMailerRuntimeConfig,
  ensureAdminMailerColumns,
  getActiveAdminMailerCredentials,
  sendMail,
  sendWelcomeEmail,
  sendAdminNotification,
  sendMerchantWelcomeEmail,
  sendPartnerWelcomeEmail,
  sendMerchantAdminNotification,
  sendPartnerAdminNotification,
  sendMerchantDecisionEmail,
  sendPartnerDecisionEmail,
}
