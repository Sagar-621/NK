const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

/**
 * MIGRATION SCRIPT
 * Add your ALTER TABLE or schema modification commands here.
 * Run with: npm run db:migrate
 */
async function migrate() {
    const db = require('./db');

    // Wait for DB init
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('🚀 Starting migrations...');

    // Example: How to add a new column
    /*
    try {
        await db.execute('ALTER TABLE admins ADD COLUMN phone VARCHAR(15)');
        console.log('✅ Added phone column to admins table');
    } catch (e) {
        if (e.message.includes('Duplicate column name')) {
            console.log('ℹ️ Column already exists, skipping.');
        } else {
            throw e;
        }
    }
    */

    // Add your actual migrations below:
    // ------------------------------------------------------------

    // await db.execute('ALTER TABLE ...');

    // ------------------------------------------------------------

    console.log('🏁 Migrations completed.');
    process.exit(0);
}

migrate().catch(e => {
    console.error('❌ Migration failed:', e.message);
    process.exit(1);
});
