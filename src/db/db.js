import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import ConnectionString from 'pg-connection-string';

dotenv.config();

// Parse PostgreSQL connection string
const cs = new ConnectionString(process.env.DATABASE_URL);

const dbConfig = {
  host: cs.host,
  port: cs.port,
  database: cs.database,
  user: cs.user,
  password: cs.password,
  ssl: {
    rejectUnauthorized: false // Development: accept self-signed certificates
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
