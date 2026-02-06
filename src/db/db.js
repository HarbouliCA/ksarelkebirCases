import pkg from 'pg';
const { Pool } = pkg;
import '../config/env.js';

// Global bypass for self-signed certificates (required for Aiven/Railway)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
};

export const client = new Pool(poolConfig);

export async function connectDB() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables. Please check your Railway/Production settings.');
  }

  try {
    const res = await client.query('SELECT NOW()');
    console.log('✅ Database connected at:', res.rows[0].now);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

export async function disconnectDB() {
  try {
    await client.end();
    console.log('✅ Database connection pool closed');
  } catch (error) {
    console.error('❌ Error closing database pool:', error.message);
  }
}

// Query helper
export async function query(text, params) {
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('❌ Query error:', error.message);
    throw error;
  }
}
