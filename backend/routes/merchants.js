const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// GET /api/merchants (Protected)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const db = require('../db');
        const [rows] = await db.execute('SELECT * FROM merchants ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error('Get merchants error:', err);
        res.status(500).json({ message: 'Failed to load merchants' });
    }
});

// POST /api/merchants (Public - for applications)
router.post('/', async (req, res) => {
    try {
        const db = require('../db');
        console.log('📝 Received Merchant Application:', req.body.store_name);
        
        const { store_name, business_type, owner_name, mobile, email, city, state, pin_code, status = 'pending',
                gstin, pan, years_in_biz, address_line1 = '', address_line2, open_from, open_to } = req.body;
        
        const [result] = await db.execute(
            `INSERT INTO merchants (store_name, business_type, owner_name, mobile, email, city, state, pin_code, address_line1, address_line2, gstin, pan, years_in_biz, open_from, open_to, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [store_name, business_type, owner_name, mobile, email, city, state, pin_code, address_line1, address_line2 || null, gstin || null, pan || null, years_in_biz || null, open_from || '08:00', open_to || '22:00', status]
        );
        
        console.log(`✅ Merchant Application stored! ID: ${result.insertId}`);
        const [rows] = await db.execute('SELECT * FROM merchants WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('❌ Create merchant error:', err.message);
        res.status(500).json({ message: 'Failed to create merchant' });
    }
});

// PATCH /api/merchants/:id (Protected)
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const db = require('../db');
        const { id } = req.params;
        const fields = req.body;
        const allowed = ['store_name','business_type','owner_name','mobile','email','city','state','pin_code','status','rejection_note','reviewed_by','reviewed_at'];
        const updates = Object.keys(fields).filter(k => allowed.includes(k));
        if (updates.length === 0) return res.status(400).json({ message: 'No valid fields' });

        const setClause = updates.map(k => `${k} = ?`).join(', ');
        const values = updates.map(k => fields[k]);
        await db.execute(`UPDATE merchants SET ${setClause}, updated_at = NOW() WHERE id = ?`, [...values, id]);
        const [rows] = await db.execute('SELECT * FROM merchants WHERE id = ?', [id]);
        res.json(rows[0]);
    } catch (err) {
        console.error('Update merchant error:', err);
        res.status(500).json({ message: 'Failed to update merchant' });
    }
});

// DELETE /api/merchants/:id (Protected)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const db = require('../db');
        await db.execute('DELETE FROM merchants WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete merchant error:', err);
        res.status(500).json({ message: 'Failed to delete merchant' });
    }
});

// POST /api/merchants/:id/approve (Protected)
router.post('/:id/approve', authMiddleware, async (req, res) => {
    try {
        const db = require('../db');
        const { reviewed_by } = req.body;
        await db.execute(`UPDATE merchants SET status='approved', reviewed_by=?, reviewed_at=NOW(), updated_at=NOW() WHERE id=?`, [reviewed_by || null, req.params.id]);
        const [rows] = await db.execute('SELECT * FROM merchants WHERE id=?', [req.params.id]);
        if (reviewed_by) {
            await db.execute(`INSERT INTO admin_activity_log (admin_id, action, target_type, target_id) VALUES (?, ?, ?, ?)`, [reviewed_by, 'approved_merchant', 'merchant', req.params.id]);
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Approve merchant error:', err);
        res.status(500).json({ message: 'Failed to approve merchant' });
    }
});

// POST /api/merchants/:id/reject (Protected)
router.post('/:id/reject', authMiddleware, async (req, res) => {
    try {
        const db = require('../db');
        const { reviewed_by, rejection_note } = req.body;
        await db.execute(`UPDATE merchants SET status='rejected', reviewed_by=?, reviewed_at=NOW(), rejection_note=?, updated_at=NOW() WHERE id=?`, [reviewed_by || null, rejection_note || null, req.params.id]);
        const [rows] = await db.execute('SELECT * FROM merchants WHERE id=?', [req.params.id]);
        if (reviewed_by) {
            await db.execute(`INSERT INTO admin_activity_log (admin_id, action, target_type, target_id) VALUES (?, ?, ?, ?)`, [reviewed_by, 'rejected_merchant', 'merchant', req.params.id]);
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Reject merchant error:', err);
        res.status(500).json({ message: 'Failed to reject merchant' });
    }
});

module.exports = router;
