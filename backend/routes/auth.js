const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const db = require('../db');
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

        const [rows] = await db.execute('SELECT * FROM admins WHERE email = ? AND is_active = 1', [email]);
        const admin = rows[0];
        if (!admin) return res.status(401).json({ message: 'Invalid email or password' });

        const valid = bcrypt.compareSync(password, admin.password_hash);
        if (!valid) return res.status(401).json({ message: 'Invalid email or password' });

        // Update last_login
        await db.execute('UPDATE admins SET last_login = NOW() WHERE id = ?', [admin.id]);

        // Generate JWT
        const token = jwt.sign(
            { id: admin.id, email: admin.email, role: admin.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                avatar_url: admin.avatar_url,
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
