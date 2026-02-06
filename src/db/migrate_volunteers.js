import '../config/env.js';
import { query, disconnectDB } from './db.js';

async function migrate() {
  try {
    console.log('🔄 Starting migration for volunteers...');

    // 1. Create volunteers table
    console.log('Creating volunteers table...');
    await query(`
      CREATE TABLE IF NOT EXISTS volunteers (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(50),
        job VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Add trigger for updated_at
    await query(`
      DROP TRIGGER IF EXISTS update_volunteers_updated_at ON volunteers;
      CREATE TRIGGER update_volunteers_updated_at BEFORE UPDATE ON volunteers
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // 2. Add volunteer_id to cases table
    console.log('Adding volunteer_id to cases table...');
    await query(`
      ALTER TABLE cases 
      ADD COLUMN IF NOT EXISTS volunteer_id INTEGER REFERENCES volunteers(id) ON DELETE SET NULL;
    `);

    console.log('Checking if column added...');
    // Create index
    await query(`
      CREATE INDEX IF NOT EXISTS idx_cases_volunteer_id ON cases(volunteer_id);
    `);

    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

migrate();
