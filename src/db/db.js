import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is not defined in environment variables');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

const dbConfig = {
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
};

export const client = new Client(dbConfig);

export async function connectDB() {
  try {
    await client.connect();
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

export async function disconnectDB() {
  try {
    await client.end();
    console.log('✅ Database disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting database:', error.message);
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
