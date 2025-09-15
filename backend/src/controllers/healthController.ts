// Health check controller
import { Router, Request, Response } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { prisma } from '@/models/prisma';
import { logger } from '@/utils/logger';

const router = Router();

// GET /health - Basic health check
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };

  res.json(health);
}));

// GET /health/detailed - Detailed system status
router.get('/detailed', asyncHandler(async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  // Check database connection
  let databaseStatus = 'healthy';
  let databaseLatency = 0;
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    databaseLatency = Date.now() - dbStart;
  } catch (error) {
    databaseStatus = 'unhealthy';
    logger.error('Database health check failed:', error);
  }

  // Check Redis connection (if configured)
  let redisStatus = 'not_configured';
  let redisLatency = 0;
  // Redis health check would go here if Redis is configured

  // Check external APIs
  const externalApis = {
    github: await checkGitHubAPI(),
    // Add other external API checks as needed
  };

  const health = {
    status: databaseStatus === 'healthy' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: {
        status: databaseStatus,
        latency: `${databaseLatency}ms`,
      },
      redis: {
        status: redisStatus,
        latency: `${redisLatency}ms`,
      },
      external_apis: externalApis,
    },
    metrics: {
      memory_usage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      cpu_usage: 'N/A', // Would need additional library to measure CPU usage
      response_time: `${Date.now() - startTime}ms`,
    },
  };

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
}));

// Helper function to check GitHub API
async function checkGitHubAPI(): Promise<string> {
  try {
    if (!process.env.GITHUB_TOKEN) {
      return 'not_configured';
    }

    const response = await fetch('https://api.github.com/rate_limit', {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      },
    });

    if (response.ok) {
      return 'healthy';
    } else {
      return 'unhealthy';
    }
  } catch (error) {
    logger.error('GitHub API health check failed:', error);
    return 'unhealthy';
  }
}

export default router;
