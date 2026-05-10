const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./db');
const authMiddleware = require('./middleware/auth');
const { bootstrapMailerRuntimeConfig } = require('./services/mailer');

const app = express();
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || '';

// ── Logging Middleware ──
app.use(morgan('dev')); 

// ── CORS ──
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const allowed = [
            /^http:\/\/localhost/,
            /^http:\/\/127\.0\.0\.1/,
        ];
        if (FRONTEND_URL) {
            FRONTEND_URL.split(',').forEach(url => {
                const trimmed = url.trim().replace(/\/$/, '');
                if (trimmed) {
                    allowed.push(new RegExp('^' + trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
                }
            });
        }
        const isAllowed = allowed.some(pattern => pattern.test(origin));
        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`⚠️ CORS blocked origin: ${origin}`);
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ── Body Parsers ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ──

// Public routes
app.use('/api/auth', require('./routes/auth'));

// Protected routes (require JWT)
app.use('/api/dashboard', authMiddleware, require('./routes/dashboard'));
app.use('/api/merchants', require('./routes/merchants'));
app.use('/api/delivery-partners', require('./routes/partners'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/job-applications', require('./routes/jobApplications'));
app.use('/api/contact-inquiries', require('./routes/inquiries'));

bootstrapMailerRuntimeConfig().catch((err) => {
    console.error('[MAIL] Runtime bootstrap failed:', err.message);
});

// Note: If some GET routes should be public (e.g. jobs for the careers page), 
// we should handle that in the route files themselves or split them.
// For now, I'll keep them protected for the admin panel and public for the main frontend if they don't use auth.
// Wait, the main frontend Careers page needs to fetch jobs.

// ── Health Check ──
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        environment: NODE_ENV,
        timestamp: new Date().toISOString(),
        message: 'NatooKart API is running 🚀'
    });
});

// ── 404 Handler ──
app.use((req, res) => {
    console.log(`⚠️  404 Not Found: ${req.method} ${req.path}`);
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`
    });
});

// ── Error Handler ──
app.use((err, req, res, next) => {
    console.error(`❌ 500 Internal Server Error [${req.method} ${req.path}]:`, err.message);
    if (err.stack) console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// ── Start Server ──
app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════╗');
    console.log(`║  NatooKart API running on port ${String(PORT).padEnd(5)}║`);
    console.log(`║  Environment: ${NODE_ENV.padEnd(21)}║`);
    console.log('╚══════════════════════════════════════╝');
    console.log('');
});

module.exports = app;
