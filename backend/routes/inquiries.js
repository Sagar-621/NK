const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// GET /api/contact-inquiries (Protected)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const db = require('../db');
        const [rows] = await db.execute('SELECT * FROM contact_inquiries WHERE is_bot = 0 ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error('Get inquiries error:', err);
        res.status(500).json({ message: 'Failed to load inquiries' });
    }
});

// POST /api/contact-inquiries (Public — from frontend Contact form)
router.post('/', async (req, res) => {
    try {
        const db = require('../db');
        const { full_name, email, phone, subject, message, is_bot = 0 } = req.body;
        if (!full_name || !email || !message) {
            return res.status(400).json({ message: 'Name, email, and message are required' });
        }
        const [result] = await db.execute(
            `INSERT INTO contact_inquiries (full_name, email, phone, subject, message, is_bot) VALUES (?, ?, ?, ?, ?, ?)`,
            [full_name, email, phone || null, subject || null, message, is_bot ? 1 : 0]
        );
        const [rows] = await db.execute('SELECT * FROM contact_inquiries WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Create inquiry error:', err);
        res.status(500).json({ message: 'Failed to submit inquiry' });
    }
});

// PATCH /api/contact-inquiries/:id (Protected)
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const db = require('../db');
        const { id } = req.params;
        const { status, replied_by } = req.body;
        const allowed = ['unread', 'read', 'replied'];
        if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

        if (status === 'replied' && replied_by) {
            await db.execute(`UPDATE contact_inquiries SET status=?, replied_by=?, replied_at=NOW() WHERE id=?`, [status, replied_by, id]);
            await db.execute(`INSERT INTO admin_activity_log (admin_id, action, target_type, target_id) VALUES (?, ?, ?, ?)`, [replied_by, 'replied_inquiry', 'contact_inquiry', id]);
        } else {
            await db.execute(`UPDATE contact_inquiries SET status=? WHERE id=?`, [status, id]);
        }
        const [rows] = await db.execute('SELECT * FROM contact_inquiries WHERE id = ?', [id]);
        res.json(rows[0]);
    } catch (err) {
        console.error('Update inquiry error:', err);
        res.status(500).json({ message: 'Failed to update inquiry' });
    }
});

// DELETE /api/contact-inquiries/:id (Protected)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const db = require('../db');
        await db.execute('DELETE FROM contact_inquiries WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete inquiry error:', err);
        res.status(500).json({ message: 'Failed to delete inquiry' });
    }
});

module.exports = router;
