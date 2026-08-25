const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function initDb() {
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    console.warn('⚠️ POSTGRES_URL is not set in .env. Skipping database initialization.');
    return;
  }

  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database. Running schema initialization...');

    const schemaPath = path.join(__dirname, '../supabase/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    await client.query(schemaSql);
    console.log('✅ Database schema initialized successfully.');
  } catch (error) {
    console.error('❌ Failed to initialize database schema:', error);
  } finally {
    await client.end();
  }
}

initDb();
