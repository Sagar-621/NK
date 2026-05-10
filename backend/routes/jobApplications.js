const express = require('express')
const multer  = require('multer')
const router  = express.Router()

const authMiddleware = require('../middleware/auth')
const db             = require('../db')
const { serveBlob }  = require('../services/imagestore')

// ── Multer: in-memory, 10 MB cap ──
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
})

const ALLOWED_RESUME_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg', 'image/png',
])

// ── Auto-migrate: ensure job_applications table exists ──
let tableReady = false
async function ensureTable() {
  if (tableReady) return
  await db.execute(`
    CREATE TABLE IF NOT EXISTS job_applications (
      id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      job_id        INT UNSIGNED NOT NULL,
      full_name     VARCHAR(200) NOT NULL,
      email         VARCHAR(255) NOT NULL,
      phone         VARCHAR(30)  NULL,
      cover_message TEXT         NULL,
      resume_data   LONGBLOB     NULL,
      resume_mime   VARCHAR(100) NULL,
      resume_name   VARCHAR(255) NULL,
      status        ENUM('pending','reviewed','shortlisted','rejected') NOT NULL DEFAULT 'pending',
      created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX (job_id),
      INDEX (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)
  tableReady = true
}

// ─────────────────────────────────────────
// PUBLIC: POST /api/job-applications
// ─────────────────────────────────────────
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    await ensureTable()

    const { job_id, full_name, email, phone, cover_message } = req.body
    if (!job_id || !full_name || !email) {
      return res.status(400).json({ message: 'job_id, full_name and email are required.' })
    }

    // Validate resume mime if uploaded
    let resumeBuffer = null
    let resumeMime   = null
    let resumeName   = null
    if (req.file) {
      if (!ALLOWED_RESUME_MIME.has(req.file.mimetype)) {
        return res.status(400).json({ message: 'Resume must be PDF, DOC, DOCX, JPG, or PNG.' })
      }
      resumeBuffer = req.file.buffer
      resumeMime   = req.file.mimetype
      resumeName   = req.file.originalname
    }

    const [result] = await db.execute(
      `INSERT INTO job_applications
        (job_id, full_name, email, phone, cover_message, resume_data, resume_mime, resume_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [job_id, full_name, email, phone || null, cover_message || null,
       resumeBuffer, resumeMime, resumeName]
    )

    res.status(201).json({ id: result.insertId, message: 'Application submitted successfully.' })
  } catch (err) {
    console.error('Job application submit error:', err)
    res.status(500).json({ message: 'Failed to submit application.' })
  }
})

// ─────────────────────────────────────────
// PROTECTED: GET /api/job-applications  (all, with job title joined)
// ─────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    await ensureTable()
    const [rows] = await db.execute(`
      SELECT ja.id, ja.job_id, ja.full_name, ja.email, ja.phone,
             ja.cover_message, ja.resume_mime, ja.resume_name,
             ja.status, ja.created_at,
             j.title AS job_title, j.department
      FROM job_applications ja
      LEFT JOIN jobs j ON j.id = ja.job_id
      ORDER BY ja.created_at DESC
    `)
    res.json(rows)
  } catch (err) {
    console.error('Fetch job applications error:', err)
    res.status(500).json({ message: 'Failed to fetch applications.' })
  }
})

// ─────────────────────────────────────────
// PROTECTED: GET /api/job-applications/:id/resume  (serve binary)
// ─────────────────────────────────────────
router.get('/:id/resume', authMiddleware, async (req, res) => {
  try {
    await ensureTable()
    const [rows] = await db.execute(
      'SELECT resume_data, resume_mime, resume_name FROM job_applications WHERE id = ?',
      [req.params.id]
    )
    if (!rows.length || !rows[0].resume_data) {
      return res.status(404).json({ message: 'No resume on record.' })
    }
    const { resume_data, resume_mime, resume_name } = rows[0]
    res.setHeader('Content-Type', resume_mime || 'application/octet-stream')
    res.setHeader('Content-Disposition', `inline; filename="${resume_name || 'resume'}"`)
    res.setHeader('Content-Length', resume_data.length)
    res.setHeader('Cache-Control', 'private, max-age=3600')
    res.end(resume_data)
  } catch (err) {
    console.error('Serve resume error:', err)
    res.status(500).json({ message: 'Failed to serve resume.' })
  }
})

// ─────────────────────────────────────────
// PROTECTED: PATCH /api/job-applications/:id  (update status)
// ─────────────────────────────────────────
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    await ensureTable()
    const { status } = req.body
    const allowed = ['pending','reviewed','shortlisted','rejected']
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' })
    }
    await db.execute('UPDATE job_applications SET status = ? WHERE id = ?', [status, req.params.id])
    const [rows] = await db.execute(`
      SELECT ja.*, j.title AS job_title, j.department
      FROM job_applications ja
      LEFT JOIN jobs j ON j.id = ja.job_id
      WHERE ja.id = ?
    `, [req.params.id])
    res.json(rows[0])
  } catch (err) {
    console.error('Update application status error:', err)
    res.status(500).json({ message: 'Failed to update status.' })
  }
})

// ─────────────────────────────────────────
// PROTECTED: DELETE /api/job-applications/:id
// ─────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await ensureTable()
    await db.execute('DELETE FROM job_applications WHERE id = ?', [req.params.id])
    res.json({ message: 'Deleted.' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete.' })
  }
})

module.exports = router
