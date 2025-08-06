import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import questionRoutes from './routes/questionRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// // CORS configuration
// const corsOptions = {
//   origin: process.env.NODE_ENV === 'production' 
//     ? process.env.ALLOWED_ORIGINS?.split(',') || []
//     : ['http://localhost:3000', 'http://127.0.0.1:3000'],
//   credentials: true,
//   optionsSuccessStatus: 200
// };
// app.use(cors(corsOptions));

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const devOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'chrome-extension://iiogdjfegnjaihggnbpnjpdhoacddoki',
      'chrome-extension://kcekjnopkegaanhopienajafabfeclml',
      'https://onlinetest.hitbullseye.com',
      'chrome-extension://nkbikglkebaogophgdehhdcgckgiaadl'
    ];

    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? (process.env.ALLOWED_ORIGINS?.split(',') || [])
      : devOrigins;

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error(`CORS not allowed for origin: ${origin}`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));


// Body parsing middleware - only for methods that should have a body
app.use('/api', (req, res, next) => {
  // Only parse JSON for POST, PUT, PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    express.json({ limit: '10mb' })(req, res, next);
  } else {
    next();
  }
});

app.use('/api', (req, res, next) => {
  // Only parse URL-encoded for POST, PUT, PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    express.urlencoded({ extended: true, limit: '10mb' })(req, res, next);
  } else {
    next();
  }
});

// Request logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', questionRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use(errorHandler);

export { app };