const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function inspect() {
    const db = require('./db');

    // Wait for DB init
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n--- DATABASE INSPECTION ---');
    console.log(`Connected to: ${process.env.DB_NAME}@${process.env.DB_HOST}\n`);

    const [tables] = await db.execute('SHOW TABLES');
    if (tables.length === 0) {
        console.log('❌ No tables found in database.');
        process.exit(0);
    }

    const tableKey = Object.keys(tables[0])[0];

    for (const table of tables) {
        const tableName = table[tableKey];
        const [[{ c: count }]] = await db.execute(`SELECT COUNT(*) as c FROM \`${tableName}\``);
        console.log(`📊 Table: ${tableName.padEnd(25)} | Rows: ${count}`);

        if (count > 0) {
            const [rows] = await db.execute(`SELECT * FROM \`${tableName}\` LIMIT 3`);
            console.table(rows);
        }
        console.log('-'.repeat(50));
    }

    process.exit(0);
}

inspect().catch(err => {
    console.error('❌ Inspect failed:', err.message);
    process.exit(1);
});
