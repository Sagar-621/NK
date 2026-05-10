function normalizeIndianMobile(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.length < 10) return ''
  return digits.slice(-10)
}

function getSmsConfig() {
  return {
    apiKey: String(process.env.TWO_FACTOR_API_KEY || '').trim(),
    senderId: String(process.env.TWO_FACTOR_SENDER_ID || 'NATOKT').trim(),
    templateName: String(process.env.TWO_FACTOR_TEMPLATE_NAME || '').trim(),
  }
}

function isSmsConfigured() {
  const { apiKey, senderId, templateName } = getSmsConfig()
  return Boolean(apiKey && senderId && templateName)
}

async function sendTransactionalSms({ mobile, message, purpose = 'notification' }) {
  const normalizedMobile = normalizeIndianMobile(mobile)
  if (!normalizedMobile) {
    throw new Error('A valid 10-digit mobile number is required')
  }

  const normalizedMessage = String(message || '').trim()
  if (!normalizedMessage) {
    throw new Error('A message is required')
  }

  const { apiKey, senderId, templateName } = getSmsConfig()
  if (!apiKey || apiKey === 'your_2factor_api_key' || !senderId || !templateName) {
    throw new Error('2Factor API key, sender ID, and template name are required for transactional SMS')
  }

  const url = `https://2factor.in/API/V1/${apiKey}/ADDON_SERVICES/SEND/TSMS`
  const payload = {
    From: senderId || 'NATOKT',
    To: `+91${normalizedMobile}`,
    Msg: normalizedMessage,
  }
  if (templateName) payload.TemplateName = templateName

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok || String(data.Status || '').toLowerCase() !== 'success') {
    throw new Error(data.Details || data.message || '2Factor did not accept the SMS request')
  }

  return { success: true, response: data }
}

module.exports = {
  normalizeIndianMobile,
  isSmsConfigured,
  sendTransactionalSms,
}
