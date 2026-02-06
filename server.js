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

// Simple CORS - Allow all origins temporarily for debugging
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Log every request
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    origin: origin
  });

  // Set CORS headers manually
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('Preflight request received for:', req.path);
    return res.status(204).end();
  }

  next();
});

// Helmet configuration - disabled temporarily for debugging
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: "cross-origin" },
//   crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
// }));

app.use(morgan('combined')); // Request logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse form data

// Serve static frontend files
app.use(express.static('public'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/people', peopleRoutes);
app.use('/api/aid-types', aidTypesRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/case-history', caseHistoryRoutes);
app.use('/api/case-aid-types', caseAidTypesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', time: new Date().toISOString() });
});

// Serve index.html for root path (SPA support)
app.get('/', (req, res) => {
  res.sendFile('public/index.html', { root: '.' });
});

// Serve dashboard.html for /dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile('public/dashboard.html', { root: '.' });
});

// Serve people.html for /people
app.get('/people.html', (req, res) => {
  res.sendFile('public/people.html', { root: '.' });
});

// Serve history.html for /history
app.get('/history.html', (req, res) => {
  res.sendFile('public/history.html', { root: '.' });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function start() {
  try {
    console.log('🔄 Attempting database connection...');
    await connectDB();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running at http://localhost:${PORT}`);
      console.log(`📱 Frontend: http://localhost:${PORT}`);
      console.log(`🔌 API: http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`\n💡 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('⚠️  Database connection error:', error.message);

    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Production mode: Cannot start without database');
      process.exit(1);
    }

    console.log('📝 Development mode: Starting server without database connection');
    console.log('⚠️  API endpoints will fail until database is configured\n');

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running at http://localhost:${PORT}`);
      console.log(`📱 Frontend: http://localhost:${PORT}`);
      console.log(`🔌 API: http://localhost:${PORT}/api (requires database)`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`\n💡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📋 To setup database: npm run setup-db\n`);
    });
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n⏹️  Shutting down gracefully...');
  await disconnectDB();
  process.exit(0);
});

start();