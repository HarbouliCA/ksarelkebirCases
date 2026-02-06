import pkg from 'pg';
const { Client } = pkg;
import '../config/env.js';
import ConnectionString from 'pg-connection-string';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse connection string
const cs = new ConnectionString(process.env.DATABASE_URL);

const client = new Client({
  host: cs.host,
  port: cs.port,
  database: cs.database,
  user: cs.user,
  password: cs.password,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Drop existing schema if it exists (CASCADE to remove everything)
    console.log('🔄 Cleaning up existing schema...');
    try {
      await client.query('DROP SCHEMA public CASCADE');
      await client.query('CREATE SCHEMA public');
      console.log('✅ Schema cleaned up');
    } catch (err) {
      // Schema doesn't exist yet, that's fine
      console.log('ℹ️ No existing schema to clean up');
    }

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('🔄 Creating tables and schema...');
    await client.query(schema);
    console.log('✅ Schema created successfully');

    // Add test admin user (password: admin123)
    const bcrypt = (await import('bcryptjs')).default;
    const hashedPassword = await bcrypt.hash('admin123', 10);

    console.log('🔄 Adding test admin user...');
    const userResult = await client.query(
      'INSERT INTO users (email, password_hash, full_name, role, is_active) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO UPDATE SET role = $4 RETURNING id',
      ['admin@ksarapp.com', hashedPassword, 'Admin User', 'admin', true]
    );
    const adminUserId = userResult.rows[0].id;
    console.log('✅ Test admin user created: admin@ksarapp.com / admin123');

    // Add test person
    console.log('🔄 Adding test person...');
    const personResult = await client.query(
      `INSERT INTO people (full_name, phone, city, number_of_people) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT DO NOTHING 
       RETURNING id`,
      ['Ahmed Mohammed', '+1234567890', 'Cairo', 3]
    );
    
    let testPersonId;
    if (personResult.rows.length > 0) {
      testPersonId = personResult.rows[0].id;
      console.log('✅ Test person created: Ahmed Mohammed');
    } else {
      // Get existing person for demo
      const existing = await client.query(
        'SELECT id FROM people WHERE full_name = $1 LIMIT 1',
        ['Ahmed Mohammed']
      );
      testPersonId = existing.rows[0]?.id || null;
    }

    // Add test case (if person exists)
    if (testPersonId) {
      console.log('🔄 Adding test case...');
      await client.query(
        `INSERT INTO cases (person_id, status, urgency, contact_method, assigned_to, created_by, summary, description) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         ON CONFLICT DO NOTHING`,
        [testPersonId, 'new', 'urgent', 'call', adminUserId, adminUserId, 'Need housing assistance', 'Family of 3 needs temporary housing']
      );
      console.log('✅ Test case created');
    }

    console.log('\n✅ Database setup completed successfully!');
    console.log('📝 Test credentials:');
    console.log('   Email: admin@ksarapp.com');
    console.log('   Password: admin123');
    console.log('\n📋 Test data:');
    console.log('   Person: Ahmed Mohammed (3 people)');
    console.log('   Phone: +1234567890');
    console.log('   City: Cairo');
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
