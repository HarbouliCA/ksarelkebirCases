import pkg from 'pg';
const { Pool } = pkg; // Using Pool instead of Client for better production performance
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

const poolConfig = {
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
};

export const client = new Pool(poolConfig);

export async function connectDB() {
  if (!connectionString) {
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
