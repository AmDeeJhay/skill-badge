// Authentication middleware
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { CustomError } from './errorHandler';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    wallet: string;
    did: string;
  };
}

// API Key authentication (simple implementation)
export const authenticateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  
  // Skip authentication for health checks
  if (req.path === '/health' || req.path.startsWith('/health/')) {
    return next();
  }

  // For development, allow requests without API key
  if (config.NODE_ENV === 'development' && !apiKey) {
    return next();
  }

  // In production, require API key
  if (config.NODE_ENV === 'production' && !apiKey) {
    throw new CustomError('API key required', 401);
  }

  // Validate API key (in a real implementation, this would check against a database)
  if (apiKey && apiKey !== 'dev-api-key') {
    throw new CustomError('Invalid API key', 401);
  }

  next();
};

// JWT authentication middleware
export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new CustomError('Access token required', 401);
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    req.user = {
      id: decoded.userId,
      wallet: decoded.wallet,
      did: decoded.did,
    };
    next();
  } catch (error) {
    logger.error('JWT verification failed:', error);
    throw new CustomError('Invalid or expired token', 401);
  }
};

// Generate JWT token
export const generateToken = (payload: { userId: string; wallet: string; did: string }): string => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
};

// Verify wallet signature (placeholder implementation)
export const verifyWalletSignature = (
  message: string,
  signature: string,
  wallet: string
): boolean => {
  // In a real implementation, this would verify the cryptographic signature
  // For now, we'll return true for development
  logger.info('Wallet signature verification (mock)', {
    message,
    signature,
    wallet,
  });
  return true;
};
