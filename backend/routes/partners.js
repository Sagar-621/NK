const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// GET /api/delivery-partners (Protected)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const db = require('../db');
        const [rows] = await db.execute('SELECT * FROM delivery_partners ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error('Get partners error:', err);
        res.status(500).json({ message: 'Failed to load partners' });
    }
});

// POST /api/delivery-partners (Public - for applications)
router.post('/', async (req, res) => {
    try {
        const db = require('../db');
        console.log('🚲 Received Delivery Partner Application:', req.body.full_name);

        const { full_name, mobile, email, city, vehicle_type, status = 'pending' } = req.body;
        const [result] = await db.execute(
            `INSERT INTO delivery_partners (full_name, mobile, email, city, vehicle_type, status) VALUES (?, ?, ?, ?, ?, ?)`,
            [full_name, mobile, email || null, city, vehicle_type, status]
        );
        
        console.log(`✅ Partner Application stored! ID: ${result.insertId}`);
        const [rows] = await db.execute('SELECT * FROM delivery_partners WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('❌ Create partner error:', err.message);
        res.status(500).json({ message: 'Failed to create partner' });
    }
});

// PATCH /api/delivery-partners/:id (Protected)
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const db = require('../db');
        const { id } = req.params;
        const fields = req.body;
        const allowed = ['full_name','mobile','email','city','vehicle_type','status','rejection_note','reviewed_by','reviewed_at'];
        const updates = Object.keys(fields).filter(k => allowed.includes(k));
        if (updates.length === 0) return res.status(400).json({ message: 'No valid fields' });

        const setClause = updates.map(k => `${k} = ?`).join(', ');
        const values = updates.map(k => fields[k]);
        await db.execute(`UPDATE delivery_partners SET ${setClause}, updated_at = NOW() WHERE id = ?`, [...values, id]);
        const [rows] = await db.execute('SELECT * FROM delivery_partners WHERE id = ?', [id]);
        res.json(rows[0]);
    } catch (err) {
        console.error('Update partner error:', err);
        res.status(500).json({ message: 'Failed to update partner' });
    }
});

// DELETE /api/delivery-partners/:id (Protected)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const db = require('../db');
        await db.execute('DELETE FROM delivery_partners WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete partner error:', err);
        res.status(500).json({ message: 'Failed to delete partner' });
    }
});

// POST /api/delivery-partners/:id/activate (Protected)
router.post('/:id/activate', authMiddleware, async (req, res) => {
    try {
        const db = require('../db');
        const { reviewed_by } = req.body;
        await db.execute(`UPDATE delivery_partners SET status='active', reviewed_by=?, reviewed_at=NOW(), updated_at=NOW() WHERE id=?`, [reviewed_by || null, req.params.id]);
        const [rows] = await db.execute('SELECT * FROM delivery_partners WHERE id=?', [req.params.id]);
        if (reviewed_by) {
            await db.execute(`INSERT INTO admin_activity_log (admin_id, action, target_type, target_id) VALUES (?, ?, ?, ?)`, [reviewed_by, 'activated_partner', 'delivery_partner', req.params.id]);
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Activate partner error:', err);
        res.status(500).json({ message: 'Failed to activate partner' });
    }
});

// POST /api/delivery-partners/:id/reject (Protected)
router.post('/:id/reject', authMiddleware, async (req, res) => {
    try {
        const db = require('../db');
        const { reviewed_by, rejection_note } = req.body;
        await db.execute(`UPDATE delivery_partners SET status='rejected', reviewed_by=?, reviewed_at=NOW(), rejection_note=?, updated_at=NOW() WHERE id=?`, [reviewed_by || null, rejection_note || null, req.params.id]);
        const [rows] = await db.execute('SELECT * FROM delivery_partners WHERE id=?', [req.params.id]);
        if (reviewed_by) {
            await db.execute(`INSERT INTO admin_activity_log (admin_id, action, target_type, target_id) VALUES (?, ?, ?, ?)`, [reviewed_by, 'rejected_partner', 'delivery_partner', req.params.id]);
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Reject partner error:', err);
        res.status(500).json({ message: 'Failed to reject partner' });
    }
});

module.exports = router;
