const express = require('express');
const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
    try {
        const db = require('../db');
        const [[{ c: merchantTotal }]]   = await db.execute('SELECT COUNT(*) as c FROM merchants');
        const [[{ c: merchantPending }]]  = await db.execute("SELECT COUNT(*) as c FROM merchants WHERE status='pending'");
        const [[{ c: partnerTotal }]]     = await db.execute('SELECT COUNT(*) as c FROM delivery_partners');
        const [[{ c: partnerPending }]]   = await db.execute("SELECT COUNT(*) as c FROM delivery_partners WHERE status='pending'");
        const [[{ c: jobsActive }]]       = await db.execute("SELECT COUNT(*) as c FROM jobs WHERE status='active'");
        const [[{ c: jobsDraft }]]        = await db.execute("SELECT COUNT(*) as c FROM jobs WHERE status='draft'");
        const [[{ c: unreadMessages }]]   = await db.execute("SELECT COUNT(*) as c FROM contact_inquiries WHERE status='unread' AND is_bot=0");

        res.json({ merchantTotal, merchantPending, partnerTotal, partnerPending, jobsActive, jobsDraft, unreadMessages });
    } catch (err) {
        console.error('Dashboard stats error:', err);
        res.status(500).json({ message: 'Failed to load stats' });
    }
});

// GET /api/dashboard/activity
router.get('/activity', async (req, res) => {
    try {
        const db = require('../db');
        const [rows] = await db.execute(`
            SELECT l.action, l.target_type, l.target_id, l.created_at, a.name as admin_name
            FROM admin_activity_log l
            LEFT JOIN admins a ON a.id = l.admin_id
            ORDER BY l.created_at DESC
            LIMIT 10
        `);
        res.json(rows);
    } catch (err) {
        console.error('Activity log error:', err);
        res.status(500).json({ message: 'Failed to load activity' });
    }
});

module.exports = router;
