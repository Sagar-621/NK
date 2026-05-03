const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const DB_NAME = process.env.DB_NAME || 'grocery_platform';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASSWORD || '';

// ── Step 1: Create database if it doesn't exist, then run schema ──
async function initDatabase() {
    console.log('🔄 Initializing database connection...');
    const bootstrap = mysql.createConnection({
        host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASS,
        multipleStatements: true
    });

    await new Promise((resolve, reject) => {
        bootstrap.connect(err => {
            if (err) {
                console.error('❌ Bootstrap connection failed:', err.message);
                return reject(err);
            }
            resolve();
        });
    });
    console.log('📡 Connected to MySQL server');

    await new Promise((resolve, reject) => {
        bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`, err => {
            if (err) {
                console.error('❌ Database creation failed:', err.message);
                return reject(err);
            }
            resolve();
        });
    });
    console.log(`✅ Database "${DB_NAME}" ready`);

    await new Promise((resolve, reject) => {
        bootstrap.query(`USE \`${DB_NAME}\``, err => {
            if (err) {
                console.error('❌ Switching to database failed:', err.message);
                return reject(err);
            }
            resolve();
        });
    });

    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    console.log('📂 Loading schema from:', schemaPath);
    if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await new Promise((resolve, reject) => {
            bootstrap.query(schema, err => {
                if (err && !err.message.includes('already exists')) {
                    console.error('❌ Schema execution failed:', err.message);
                    return reject(err);
                }
                resolve();
            });
        });
        console.log('✅ Schema tables ready');
    } else {
        console.warn('⚠️ Schema file not found at:', schemaPath);
    }

    bootstrap.end();
}

// Run init (non-blocking — server still starts while this finishes)
initDatabase().catch(err => {
    console.error('❌ DB init failed:', err.message);
    console.error('   Make sure MySQL is running and DB_USER/DB_PASSWORD in .env are correct.');
});

// ── Step 2: Main connection pool ──
const pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: false
});

const promisePool = pool.promise();

// Verify pool is usable (with retry — DB might not exist yet for 1-2ms)
setTimeout(() => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('❌ DB Connection Failed:', err.message);
            return;
        }
        console.log('✅ MySQL connected successfully');
        connection.release();
    });
}, 500);

module.exports = promisePool;
