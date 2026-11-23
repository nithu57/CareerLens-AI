import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/db.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import savedJobRoutes from './routes/savedJobRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import skillAnalysisRoutes from './routes/skillAnalysisRoutes.js';
import savedResourceRoutes from './routes/savedResourceRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import confidenceRoutes from './routes/confidenceRoutes.js';

const app = express();
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 1. Security & Core Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Dynamic CORS configuration for React Web, Flutter Web & Mobile
const allowedOrigins = (process.env.WEB_ORIGIN || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (native mobile apps, curl, Postman)
      // Allow any local development origin (React, Vite, Flutter Web on random ports)
      if (
        !origin ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*')
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 2. Base Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    project: 'CareerLens AI Shared MERN Backend',
    message: 'Backend is online and connected to MongoDB',
    clientsSupported: ['CareerLens React Web', 'CareerLens Flutter Mobile'],
    environment: NODE_ENV,
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      resumes: '/api/resumes',
      savedJobs: '/api/saved-jobs',
      roadmap: '/api/roadmap',
      chat: '/api/chat',
      skillAnalyses: '/api/skill-analyses',
      savedResources: '/api/saved-resources',
      notifications: '/api/notifications',
      confidenceScore: '/api/confidence-score',
    },
    timestamp: new Date().toISOString(),
  });
});

// Root fallback
app.get('/', (req, res) => {
  res.redirect('/api/health');
});

// 3. API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/saved-jobs', savedJobRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/skill-analyses', skillAnalysisRoutes);
app.use('/api/saved-resources', savedResourceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/confidence-score', confidenceRoutes);

// 4. Global 404 & Error Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Endpoint ${req.originalUrl} not found`,
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal server error',
  });
});

// 5. Start Server after Database Connection
const startServer = async () => {
  try {
    // Connect to MongoDB (server2 / careerlens)
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`====================================================`);
      console.log(`  🚀 CareerLens AI - Shared MERN Backend Active`);
      console.log(`  Environment : ${NODE_ENV}`);
      console.log(`  Server URL  : http://localhost:${PORT}`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`  Database    : Connected to MongoDB (careerlens)`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
