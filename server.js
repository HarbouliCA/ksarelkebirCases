import './src/config/env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB, disconnectDB } from './src/db/db.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';
import authRoutes from './src/routes/auth.js';
import casesRoutes from './src/routes/cases.js';
import usersRoutes from './src/routes/users.js';
import peopleRoutes from './src/routes/people.js';
import aidTypesRoutes from './src/routes/aid-types.js';
import notesRoutes from './src/routes/notes.js';
import caseHistoryRoutes from './src/routes/case-history.js';
import caseAidTypesRoutes from './src/routes/case-aid-types.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Prevent crashes
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

// CORS - handle at the absolute top
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  console.log(`${req.method} ${req.url} from ${req.headers.origin || 'direct'}`);
  
  if (req.method === 'OPTIONS') {
    console.log(`✅ OPTIONS: ${req.url}`);
    return res.sendStatus(204);
  }
  next();
});

app.use(cors({ origin: true, credentials: true }));

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Health check FIRST
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', time: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/people', peopleRoutes);
app.use('/api/aid-types', aidTypesRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/case-history', caseHistoryRoutes);
app.use('/api/case-aid-types', caseAidTypesRoutes);

// Static pages
app.get('/', (req, res) => res.sendFile('public/index.html', { root: '.' }));
app.get('/dashboard', (req, res) => res.sendFile('public/dashboard.html', { root: '.' }));
app.get('/people.html', (req, res) => res.sendFile('public/people.html', { root: '.' }));
app.get('/history.html', (req, res) => res.sendFile('public/history.html', { root: '.' }));

// Error handling
app.use(notFoundHandler);
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server - NEVER exit on error
async function start() {
  let dbConnected = false;
  
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected');
    dbConnected = true;
  } catch (error) {
    console.error('⚠️ Database failed:', error.message);
    console.log('⚠️ Starting anyway - DB routes will fail');
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log('🚀 SERVER RUNNING');
    console.log(`Port: ${PORT}`);
    console.log(`Host: 0.0.0.0`);
    console.log(`DB: ${dbConnected ? '✅' : '❌'}`);
    console.log(`Env: ${process.env.NODE_ENV || 'dev'}`);
    console.log('='.repeat(50));
  });

  server.on('error', (error) => {
    console.error('❌ Server error:', error);
  });
}

process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  try {
    await disconnectDB();
  } catch (e) {
    console.error('Disconnect error:', e);
  }
  process.exit(0);
});

start().catch((error) => {
  console.error('❌ Start failed:', error);
  // Don't exit - try to start anyway
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Emergency start on port ${PORT}`);
  });
});