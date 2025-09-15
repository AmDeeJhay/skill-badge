// Main application entry point
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { config } from '@/config';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { requestLogger } from '@/middleware/requestLogger';
import { authenticateApiKey } from '@/middleware/auth';

// Import routes
import userRoutes from '@/controllers/userController';
import credentialRoutes from '@/controllers/credentialController';
import verificationRoutes from '@/controllers/verificationController';
import analyticsRoutes from '@/controllers/analyticsController';
import healthRoutes from '@/controllers/healthController';

// Import background jobs
import { backgroundJobs } from '@/jobs/backgroundJobs';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: config.FRONTEND_URL?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ 
  limit: config.UPLOAD_MAX_SIZE,
  verify: (req, res, buf) => {
    // Verify JSON payload integrity if needed
  }
}));
app.use(express.urlencoded({ extended: true, limit: config.UPLOAD_MAX_SIZE }));

// Compression middleware
app.use(compression());

// Request logging
app.use(requestLogger);

// API key authentication
app.use(authenticateApiKey);

// Health check endpoint (no auth required)
app.use('/health', healthRoutes);

// API routes
app.use(`/api/${config.API_VERSION}/users`, userRoutes);
app.use(`/api/${config.API_VERSION}/credentials`, credentialRoutes);
app.use(`/api/${config.API_VERSION}/verify`, verificationRoutes);
app.use(`/api/${config.API_VERSION}/analytics`, analyticsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${config.NODE_ENV}`);
  logger.info(`API Version: ${config.API_VERSION}`);
  logger.info(`Frontend URL: ${config.FRONTEND_URL}`);
  
  // Start background jobs
  backgroundJobs.start();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
