const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function secureAdmin() {
    console.log('🔐 Securing Admin Credentials...');
    
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'grocery_platform'
    });

    const email = 'admin@natookart.com';
    const rawPassword = 'NatooKart@2026';
    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(rawPassword, salt);

    try {
        // Clear old demo admins and insert the new one
        await db.execute('DELETE FROM admins WHERE email != ?', [email]);
        
        const [rows] = await db.execute('SELECT id FROM admins WHERE email = ?', [email]);
        
        if (rows.length > 0) {
            await db.execute('UPDATE admins SET password_hash = ?, is_active = 1 WHERE email = ?', [hash, email]);
            console.log(`✅ Admin ${email} updated successfully.`);
        } else {
            await db.execute(
                'INSERT INTO admins (name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?)',
                ['NatooKart Admin', email, hash, 'super_admin', 1]
            );
            console.log(`✅ Admin ${email} created successfully.`);
        }
    } catch (err) {
        console.error('❌ Error updating admin:', err.message);
    } finally {
        await db.end();
    }
}

secureAdmin();
