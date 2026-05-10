/**
 * imagestore.js — Binary BLOB storage in MySQL
 * 
 * Strategy: Store raw file buffers directly in a LONGBLOB column.
 * This is more efficient than base64 text for binary data.
 */

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/svg+xml',
  'application/pdf',
])

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

/**
 * Validates the file and returns the buffer if okay.
 */
function validateAndGetBuffer(file) {
  if (!file) return null

  const mimeType = file.mimetype || 'application/octet-stream'
  if (!ALLOWED_MIME.has(mimeType)) {
    throw new Error(`File type "${mimeType}" is not allowed.`)
  }

  if (file.size > MAX_BYTES) {
    throw new Error('File is too large (max 10MB)')
  }

  return file.buffer
}

/**
 * Serve raw binary data from DB
 */
function serveBlob(buffer, mimeType, res) {
  if (!buffer) {
    return res.status(404).json({ message: 'No image on record' })
  }

  res.setHeader('Content-Type', mimeType || 'application/octet-stream')
  res.setHeader('Content-Length', buffer.length)
  res.setHeader('Cache-Control', 'public, max-age=86400')
  res.end(buffer)
}

module.exports = { validateAndGetBuffer, serveBlob }
