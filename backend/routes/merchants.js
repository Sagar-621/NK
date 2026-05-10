const express = require('express')
const multer  = require('multer')
const router  = express.Router()

const authMiddleware = require('../middleware/auth')
const db             = require('../db')
const { validateAndGetBuffer, serveBlob } = require('../services/imagestore')
const { sendMerchantWelcomeEmail, sendMerchantAdminNotification, sendMerchantDecisionEmail } = require('../services/mailer')
const { normalizeIndianMobile, sendTransactionalSms }            = require('../services/sms')

// ── Multer: in-memory, 10 MB cap ──
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
})

// ── One-time column migrations ──
let merchantColumnsReady = false

async function ensureMerchantColumns() {
  if (merchantColumnsReady) return

  const columns = [
    ['id_proof_url',     'VARCHAR(500) NULL'],
    // Using LONGBLOB for true binary storage
    ['id_proof_data',    'LONGBLOB NULL'],
    ['id_proof_mime',    'VARCHAR(100) NULL'],
  ]

  for (const [name, definition] of columns) {
    const [rows] = await db.execute(
      `SELECT COLUMN_NAME
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME   = 'merchants'
         AND COLUMN_NAME  = ?`,
      [name]
    )
    if (!rows.length) {
      await db.execute(`ALTER TABLE merchants ADD COLUMN ${name} ${definition}`)
    } else if (name === 'id_proof_data') {
        // If it was previously MEDIUMTEXT (from my last run), upgrade it to LONGBLOB
        const [typeRow] = await db.execute(
            `SELECT DATA_TYPE FROM information_schema.COLUMNS 
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'merchants' AND COLUMN_NAME = 'id_proof_data'`
        );
        if (typeRow[0]?.DATA_TYPE === 'mediumtext') {
            console.log('🔄 Upgrading id_proof_data from MEDIUMTEXT to LONGBLOB...');
            await db.execute(`ALTER TABLE merchants MODIFY COLUMN id_proof_data LONGBLOB`);
        }
    }
  }

  merchantColumnsReady = true
}

// ── Helpers ──

function normalizeHours(value) {
  if (!value) return { open_from: '08:00:00', open_to: '22:00:00' }
  const hours = String(value).trim()
  if (/24/i.test(hours)) return { open_from: '00:00:00', open_to: '23:59:59' }
  const [fromPart, toPart] = hours.split(/[-–—]/).map((p) => String(p || '').trim())
  const to24 = (input, fallback) => {
    const raw   = String(input || fallback || '').trim()
    const match = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i)
    if (!match) return fallback
    let hour = Number(match[1])
    const minute = Number(match[2] || '0')
    const period = String(match[3] || '').toUpperCase()
    if (period === 'PM' && hour !== 12) hour += 12
    if (period === 'AM' && hour === 12)  hour  = 0
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`
  }
  return { open_from: to24(fromPart, '08:00:00'), open_to: to24(toPart, '22:00:00') }
}

// ── Routes ──

// GET /api/merchants (Protected)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Exclude heavy binary data from list
    const [rows] = await db.execute(
      `SELECT id, store_name, business_type, gstin, pan, years_in_biz,
              owner_name, mobile, email,
              id_proof_url, id_proof_mime,
              address_line1, address_line2, city, state, pin_code,
              open_from, open_to, status, rejection_note,
              reviewed_by, reviewed_at, created_at, updated_at
       FROM merchants ORDER BY created_at DESC`
    )
    res.json(rows)
  } catch (err) {
    console.error('Get merchants error:', err)
    res.status(500).json({ message: 'Failed to load merchants' })
  }
})

// GET /api/merchants/:id/id-proof  — serve binary image from BLOB (Protected)
router.get('/:id/id-proof', authMiddleware, async (req, res) => {
  try {
    await ensureMerchantColumns()
    const [rows] = await db.execute(
      'SELECT id_proof_data, id_proof_mime FROM merchants WHERE id = ? LIMIT 1',
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ message: 'Merchant not found' })
    
    const merchant = rows[0]
    serveBlob(merchant.id_proof_data, merchant.id_proof_mime, res)
  } catch (err) {
    console.error('Serve id-proof error:', err)
    res.status(500).json({ message: 'Failed to serve image' })
  }
})

// POST /api/merchants (Public)
router.post('/', upload.single('id_proof'), async (req, res) => {
  try {
    await ensureMerchantColumns()

    const {
      store_name, business_type, owner_name, mobile, email,
      city, state, pin_code,
      status        = 'pending',
      gstin, pan, years_in_biz,
      address_line1 = '', address_line2,
      operating_hours, open_from, open_to,
    } = req.body

    if (!store_name || !business_type || !owner_name || !mobile || !email || !city || !state || !pin_code) {
      return res.status(400).json({ message: 'Missing required merchant details' })
    }

    const { open_from: normFrom, open_to: normTo } = operating_hours
      ? normalizeHours(operating_hours)
      : { open_from: open_from || '08:00:00', open_to: open_to || '22:00:00' }

    // ── Image: get binary buffer ──
    let buffer = null
    let mimeType = null

    if (req.file) {
      buffer = validateAndGetBuffer(req.file)
      mimeType = req.file.mimetype
    }

    const [result] = await db.execute(
      `INSERT INTO merchants (
         store_name, business_type, gstin, pan, years_in_biz,
         owner_name, mobile, email,
         id_proof_data, id_proof_mime,
         address_line1, address_line2, city, state, pin_code,
         open_from, open_to, status
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        store_name, business_type, gstin || null, pan || null, years_in_biz || null,
        owner_name, mobile, email,
        buffer, mimeType,
        address_line1 || '', address_line2 || null, city, state, pin_code,
        normFrom, normTo, status,
      ]
    )

    const newId = result.insertId

    // Set the endpoint URL so the frontend can retrieve the blob
    const idProofUrl = buffer ? `/api/merchants/${newId}/id-proof` : null
    if (idProofUrl) {
      await db.execute('UPDATE merchants SET id_proof_url = ? WHERE id = ?', [idProofUrl, newId])
    }

    const [rows] = await db.execute(
      `SELECT id, store_name, owner_name, email, mobile, id_proof_url, status FROM merchants WHERE id = ?`,
      [newId]
    )
    const merchant = rows[0]

    // Notifications
    const deliveryResults = await Promise.allSettled([
      sendMerchantWelcomeEmail({ to: email, storeName: store_name, ownerName: owner_name }),
      sendMerchantAdminNotification({ storeName: store_name, ownerName: owner_name, email, mobile, city, status, proofUrl: idProofUrl }),
      normalizeIndianMobile(mobile) ? sendTransactionalSms({ mobile, purpose: 'welcome', message: `Hi ${owner_name}, your application for ${store_name} is received.` }) : null
    ])
    deliveryResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`[MERCHANT NOTIFY] delivery #${index + 1} failed:`, result.reason?.message || result.reason || 'Unknown error')
      }
    })

    res.status(201).json({ success: true, merchant })
  } catch (err) {
    console.error('Create merchant error:', err.message)
    res.status(500).json({ message: err.message || 'Failed to create merchant' })
  }
})

// (Other routes PATCH/DELETE/APPROVE/REJECT remain same as before)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    await ensureMerchantColumns()
    const { id } = req.params
    const fields = req.body
    const allowed = ['store_name', 'business_type', 'owner_name', 'mobile', 'email', 'city', 'state', 'pin_code', 'status', 'rejection_note', 'reviewed_by', 'reviewed_at']
    const updates = Object.keys(fields).filter((k) => allowed.includes(k))
    if (updates.length === 0) return res.status(400).json({ message: 'No valid fields' })
    const setClause = updates.map((k) => `${k} = ?`).join(', ')
    const values = updates.map((k) => fields[k])
    await db.execute(`UPDATE merchants SET ${setClause}, updated_at = NOW() WHERE id = ?`, [...values, id])
    const [rows] = await db.execute('SELECT * FROM merchants WHERE id = ?', [id])
    res.json(rows[0])
  } catch (err) {
    console.error('Update merchant error:', err)
    res.status(500).json({ message: 'Failed to update merchant' })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.execute('DELETE FROM merchants WHERE id = ?', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    console.error('Delete merchant error:', err)
    res.status(500).json({ message: 'Failed to delete merchant' })
  }
})

router.post('/:id/approve', authMiddleware, async (req, res) => {
  try {
    const { reviewed_by } = req.body
    await db.execute(`UPDATE merchants SET status='approved', reviewed_by=?, reviewed_at=NOW(), updated_at=NOW() WHERE id=?`, [reviewed_by || null, req.params.id])
    const [rows] = await db.execute('SELECT * FROM merchants WHERE id=?', [req.params.id])
    if (reviewed_by) await db.execute(`INSERT INTO admin_activity_log (admin_id, action, target_type, target_id) VALUES (?, ?, ?, ?)`, [reviewed_by, 'approved_merchant', 'merchant', req.params.id])
    const merchant = rows[0]
    if (merchant) {
      Promise.allSettled([
        sendMerchantDecisionEmail({
          to: merchant.email,
          storeName: merchant.store_name,
          ownerName: merchant.owner_name,
          status: 'approved',
        })
      ]).then(results => {
        results.forEach((r, i) => {
          if (r.status === 'rejected') console.error(`[MERCHANT APPROVE NOTIFY] Failed:`, r.reason);
        });
      });
    }
    res.json(merchant)
  } catch (err) {
    console.error('Approve merchant error:', err); res.status(500).json({ message: 'Failed to approve merchant' })
  }
})

router.post('/:id/reject', authMiddleware, async (req, res) => {
  try {
    const { reviewed_by, rejection_note } = req.body
    await db.execute(`UPDATE merchants SET status='rejected', reviewed_by=?, reviewed_at=NOW(), rejection_note=?, updated_at=NOW() WHERE id=?`, [reviewed_by || null, rejection_note || null, req.params.id])
    const [rows] = await db.execute('SELECT * FROM merchants WHERE id=?', [req.params.id])
    if (reviewed_by) await db.execute(`INSERT INTO admin_activity_log (admin_id, action, target_type, target_id) VALUES (?, ?, ?, ?)`, [reviewed_by, 'rejected_merchant', 'merchant', req.params.id])
    const merchant = rows[0]
    if (merchant) {
      Promise.allSettled([
        sendMerchantDecisionEmail({
          to: merchant.email,
          storeName: merchant.store_name,
          ownerName: merchant.owner_name,
          status: 'rejected',
          note: rejection_note || merchant.rejection_note || '',
        })
      ]).then(results => {
        results.forEach((r, i) => {
          if (r.status === 'rejected') console.error(`[MERCHANT REJECT NOTIFY] Failed:`, r.reason);
        });
      });
    }
    res.json(merchant)
  } catch (err) {
    console.error('Reject merchant error:', err); res.status(500).json({ message: 'Failed to reject merchant' })
  }
})

module.exports = router
