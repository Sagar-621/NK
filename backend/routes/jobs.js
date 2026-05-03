const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// GET /api/jobs (Public - for Careers page)
router.get('/', async (req, res) => {
    try {
        const db = require('../db');
        const status = req.query.status;
        let query = 'SELECT * FROM jobs';
        let params = [];
        if (status && ['draft', 'active', 'closed'].includes(status)) {
            query += ' WHERE status = ?';
            params.push(status);
        }
        query += ' ORDER BY created_at DESC';
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (err) {
        console.error('Get jobs error:', err);
        res.status(500).json({ message: 'Failed to load jobs' });
    }
});

// POST /api/jobs (Protected)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const db = require('../db');
        const { title, department, location, job_type = 'Full-time', description, requirements, deadline, status = 'draft', posted_by } = req.body;
        const [result] = await db.execute(
            `INSERT INTO jobs (title, department, location, job_type, description, requirements, deadline, status, posted_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, department, location, job_type, description, requirements || null, deadline || null, status, posted_by || null]
        );
        const [rows] = await db.execute('SELECT * FROM jobs WHERE id = ?', [result.insertId]);
        if (posted_by) {
            await db.execute(`INSERT INTO admin_activity_log (admin_id, action, target_type, target_id) VALUES (?, ?, ?, ?)`, [posted_by, 'posted_job', 'job', result.insertId]);
        }
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Create job error:', err);
        res.status(500).json({ message: 'Failed to create job' });
    }
});

// PATCH /api/jobs/:id (Protected)
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const db = require('../db');
        const { id } = req.params;
        const fields = req.body;
        const allowed = ['title','department','location','job_type','description','requirements','deadline','status','posted_by'];
        const updates = Object.keys(fields).filter(k => allowed.includes(k));
        if (updates.length === 0) return res.status(400).json({ message: 'No valid fields' });

        const setClause = updates.map(k => `${k} = ?`).join(', ');
        const values = updates.map(k => fields[k]);
        await db.execute(`UPDATE jobs SET ${setClause}, updated_at = NOW() WHERE id = ?`, [...values, id]);
        const [rows] = await db.execute('SELECT * FROM jobs WHERE id = ?', [id]);
        res.json(rows[0]);
    } catch (err) {
        console.error('Update job error:', err);
        res.status(500).json({ message: 'Failed to update job' });
    }
});

// DELETE /api/jobs/:id (Protected)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const db = require('../db');
        await db.execute('DELETE FROM jobs WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete job error:', err);
        res.status(500).json({ message: 'Failed to delete job' });
    }
});

module.exports = router;
