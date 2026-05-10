const express = require('express')
const multer  = require('multer')
const router  = express.Router()

const authMiddleware = require('../middleware/auth')
const db             = require('../db')
const { validateAndGetBuffer, serveBlob } = require('../services/imagestore')
const { sendPartnerWelcomeEmail, sendPartnerAdminNotification, sendPartnerDecisionEmail } = require('../services/mailer')
const { normalizeIndianMobile, sendTransactionalSms } = require('../services/sms')

// ── Multer: in-memory, 10 MB cap ──
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
})

// ── Auto-migrate: ensure all needed columns exist ──
let partnerColumnsReady = false
async function ensurePartnerColumns() {
  if (partnerColumnsReady) return
  const needed = [
    ['email',          'VARCHAR(255) NULL'],
    ['rejection_note', 'TEXT NULL'],
    ['reviewed_by',    'INT UNSIGNED NULL'],
    ['reviewed_at',    'DATETIME NULL'],
    // Eligibility fields
    ['date_of_birth',  'DATE NULL'],
    ['id_type',        "ENUM('Aadhaar','PAN','Driving License') NULL"],
    ['id_number',      'VARCHAR(30) NULL'],
    ['id_proof_data',  'LONGBLOB NULL'],
    ['id_proof_mime',  'VARCHAR(100) NULL'],
    ['has_smartphone', 'BOOLEAN NOT NULL DEFAULT FALSE'],
    ['flexible_hours', 'BOOLEAN NOT NULL DEFAULT FALSE'],
    ['clean_record',   'BOOLEAN NOT NULL DEFAULT FALSE'],
  ]
  for (const [name, def] of needed) {
    const [rows] = await db.execute(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'delivery_partners' AND COLUMN_NAME = ?`,
      [name]
    )
    if (!rows.length) {
      await db.execute(`ALTER TABLE delivery_partners ADD COLUMN ${name} ${def}`)
      console.log(`[DB] Added missing column: delivery_partners.${name}`)
    }
  }
  partnerColumnsReady = true
}

// Normalise vehicle type to DB ENUM values
function normalizeVehicle(v) {
  const map = { motorcycle: 'Bike', bike: 'Bike', scooter: 'Scooter', ev: 'Scooter',
                electric: 'Scooter',  car: 'Car' }
  return map[String(v || '').toLowerCase()] || 'Bike'
}

function validateIdNumber(type, number) {
  if (!number) return false
  const val = String(number).replace(/[-\s]/g, '').toUpperCase()
  if (type === 'Aadhaar') return /^\d{12}$/.test(val)
  if (type === 'PAN') return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val)
  if (type === 'Driving License') return /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/.test(val)
  return true
}

// GET /api/delivery-partners (Protected)
router.get('/', authMiddleware, async (req, res) => {
  try {
    await ensurePartnerColumns()
    const [rows] = await db.execute('SELECT * FROM delivery_partners ORDER BY created_at DESC')
    res.json(rows)
  } catch (err) {
    console.error('Get partners error:', err)
    res.status(500).json({ message: 'Failed to load partners' })
  }
})

// GET /api/delivery-partners/:id/id-proof (Protected)
router.get('/:id/id-proof', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id_proof_data, id_proof_mime FROM delivery_partners WHERE id = ?', [req.params.id])
    if (!rows.length || !rows[0].id_proof_data) return res.status(404).send('Not found')
    serveBlob(rows[0].id_proof_data, rows[0].id_proof_mime, res)
  } catch (err) {
    res.status(500).send('Error')
  }
})

// POST /api/delivery-partners (Public - for applications)
router.post('/', upload.single('id_proof'), async (req, res) => {
  try {
    await ensurePartnerColumns()
    const {
      full_name, mobile, email, city, vehicle_type, status = 'pending',
      date_of_birth, id_type, id_number,
      has_smartphone, flexible_hours, clean_record,
    } = req.body

    if (!full_name || !mobile || !city || !vehicle_type) {
      return res.status(400).json({ message: 'Missing required fields: full_name, mobile, city, vehicle_type' })
    }

    if (id_type && id_number && !validateIdNumber(id_type, id_number)) {
      return res.status(400).json({ message: `Invalid ${id_type} number format` })
    }

    let proofBuffer = null
    let proofMime   = null

    if (req.file) {
      proofBuffer = validateAndGetBuffer(req.file)
      proofMime   = req.file.mimetype
    }

    const safeVehicle = normalizeVehicle(vehicle_type)

    const [result] = await db.execute(
      `INSERT INTO delivery_partners
         (full_name, mobile, email, city, vehicle_type, status,
          date_of_birth, id_type, id_number,
          id_proof_data, id_proof_mime,
          has_smartphone, flexible_hours, clean_record)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        full_name, mobile, email || null, city, safeVehicle, status,
        date_of_birth || null,
        id_type       || null,
        id_number     || null,
        proofBuffer,
        proofMime,
        has_smartphone === 'true' || has_smartphone === true ? 1 : 0,
        flexible_hours === 'true' || flexible_hours === true ? 1 : 0,
        clean_record   === 'true' || clean_record   === true ? 1 : 0,
      ]
    )

    const [rows] = await db.execute('SELECT * FROM delivery_partners WHERE id = ?', [result.insertId])
    const partner = rows[0] || null

    const deliveryResults = await Promise.allSettled([
      sendPartnerWelcomeEmail({
        to: partner?.email || email,
        fullName: partner?.full_name || full_name,
      }),
      sendPartnerAdminNotification({
        fullName: partner?.full_name || full_name,
        email: partner?.email || email || '',
        mobile: partner?.mobile || mobile,
        city: partner?.city || city,
        vehicleType: partner?.vehicle_type || vehicle_type,
        status: partner?.status || status,
      }),
      normalizeIndianMobile(mobile)
        ? sendTransactionalSms({
            mobile,
            purpose: 'partner',
            message: `Hi ${full_name || 'there'}, your NatooKart delivery partner application has been received. Our team will review it shortly.`,
          })
        : Promise.resolve({ skipped: true }),
    ])
    deliveryResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`[PARTNER NOTIFY] delivery #${index + 1} failed:`, result.reason?.message || result.reason || 'Unknown error')
      }
    })

    res.status(201).json({
      success: true,
      message: 'Delivery partner application submitted successfully',
      partner,
    })
  } catch (err) {
    console.error('Create partner error:', err.message)
    res.status(500).json({ message: err.message || 'Failed to create partner' })
  }
})

// PATCH /api/delivery-partners/:id (Protected)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const fields = req.body
    const allowed = ['full_name', 'mobile', 'email', 'city', 'vehicle_type', 'status', 'rejection_note', 'reviewed_by', 'reviewed_at']
    const updates = Object.keys(fields).filter((k) => allowed.includes(k))
    if (updates.length === 0) return res.status(400).json({ message: 'No valid fields' })

    const setClause = updates.map((k) => `${k} = ?`).join(', ')
    const values = updates.map((k) => fields[k])
    await db.execute(`UPDATE delivery_partners SET ${setClause}, updated_at = NOW() WHERE id = ?`, [...values, id])
    const [rows] = await db.execute('SELECT * FROM delivery_partners WHERE id = ?', [id])
    res.json(rows[0])
  } catch (err) {
    console.error('Update partner error:', err)
    res.status(500).json({ message: 'Failed to update partner' })
  }
})

// DELETE /api/delivery-partners/:id (Protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.execute('DELETE FROM delivery_partners WHERE id = ?', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    console.error('Delete partner error:', err)
    res.status(500).json({ message: 'Failed to delete partner' })
  }
})

// POST /api/delivery-partners/:id/activate (Protected)
router.post('/:id/activate', authMiddleware, async (req, res) => {
  try {
    const { reviewed_by } = req.body
    await db.execute(`UPDATE delivery_partners SET status='active', reviewed_by=?, reviewed_at=NOW(), updated_at=NOW() WHERE id=?`, [reviewed_by || null, req.params.id])
    const [rows] = await db.execute('SELECT * FROM delivery_partners WHERE id=?', [req.params.id])
    if (reviewed_by) {
      await db.execute(`INSERT INTO admin_activity_log (admin_id, action, target_type, target_id) VALUES (?, ?, ?, ?)`, [reviewed_by, 'activated_partner', 'delivery_partner', req.params.id])
    }
    const partner = rows[0]
    if (partner) {
      Promise.allSettled([
        sendPartnerDecisionEmail({
          to: partner.email,
          fullName: partner.full_name,
          status: 'approved',
        })
      ]).then(results => {
        results.forEach((r, i) => {
          if (r.status === 'rejected') console.error(`[PARTNER ACTIVATE NOTIFY] Failed:`, r.reason);
        });
      });
    }
    res.json(partner)
  } catch (err) {
    console.error('Activate partner error:', err)
    res.status(500).json({ message: 'Failed to activate partner' })
  }
})

// POST /api/delivery-partners/:id/reject (Protected)
router.post('/:id/reject', authMiddleware, async (req, res) => {
  try {
    const { reviewed_by, rejection_note } = req.body
    await db.execute(`UPDATE delivery_partners SET status='rejected', reviewed_by=?, reviewed_at=NOW(), rejection_note=?, updated_at=NOW() WHERE id=?`, [reviewed_by || null, rejection_note || null, req.params.id])
    const [rows] = await db.execute('SELECT * FROM delivery_partners WHERE id=?', [req.params.id])
    if (reviewed_by) {
      await db.execute(`INSERT INTO admin_activity_log (admin_id, action, target_type, target_id) VALUES (?, ?, ?, ?)`, [reviewed_by, 'rejected_partner', 'delivery_partner', req.params.id])
    }
    const partner = rows[0]
    if (partner) {
      Promise.allSettled([
        sendPartnerDecisionEmail({
          to: partner.email,
          fullName: partner.full_name,
          status: 'rejected',
          note: rejection_note || partner.rejection_note || '',
        })
      ]).then(results => {
        results.forEach((r, i) => {
          if (r.status === 'rejected') console.error(`[PARTNER REJECT NOTIFY] Failed:`, r.reason);
        });
      });
    }
    res.json(partner)
  } catch (err) {
    console.error('Reject partner error:', err)
    res.status(500).json({ message: 'Failed to reject partner' })
  }
})

module.exports = router
