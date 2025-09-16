// Analytics controller
import type { Router, Request, Response } from 'express';
// import type { query, validationResult } from 'express-validator';
import { asyncHandler } from '@/middleware/errorHandler';
import { AnalyticsService } from '@/services/analyticsService';
import { ApiResponse } from '@/types';

// Import express and express-validator dynamically or assume they're available
const express = require('express');
const { query: queryValidator, validationResult: validateResult } = require('express-validator');

const router: Router = express.Router();
const analyticsService = new AnalyticsService();

// GET /analytics/overview - Platform statistics
router.get('/overview', asyncHandler(async (_req: Request, res: Response) => {
  const overview = await analyticsService.getOverviewStats();

  const response: ApiResponse = {
    success: true,
    data: overview,
    timestamp: new Date().toISOString(),
  };

  res.json(response);
}));

// GET /analytics/skills-trending - Popular skills
router.get('/skills-trending', [
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validateResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Invalid query parameters',
      timestamp: new Date().toISOString(),
    });
  }

  const limit = parseInt(req.query.limit as string) || 20;
  const trendingSkills = await analyticsService.getTrendingSkills(limit);

  const response: ApiResponse = {
    success: true,
    data: trendingSkills,
    timestamp: new Date().toISOString(),
  };

  res.json(response);
}));

// GET /analytics/verification-stats - Verification success rates
router.get('/verification-stats', asyncHandler(async (_req: Request, res: Response) => {
  const stats = await analyticsService.getVerificationStats();

  const response: ApiResponse = {
    success: true,
    data: stats,
    timestamp: new Date().toISOString(),
  };

  res.json(response);
}));

// GET /analytics/user-growth - User acquisition metrics
router.get('/user-growth', [
  queryValidator('period').optional().isIn(['7d', '30d', '90d', '1y']),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validateResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Invalid period parameter',
      timestamp: new Date().toISOString(),
    });
  }

  const period = req.query.period as string || '30d';
  const userGrowth = await analyticsService.getUserGrowth(period);

  const response: ApiResponse = {
    success: true,
    data: userGrowth,
    timestamp: new Date().toISOString(),
  };

  res.json(response);
}));

// GET /analytics/organizations - Organization statistics
router.get('/organizations', [
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validateResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Invalid query parameters',
      timestamp: new Date().toISOString(),
    });
  }

  const limit = parseInt(req.query.limit as string) || 20;
  const orgStats = await analyticsService.getOrganizationStats(limit);

  const response: ApiResponse = {
    success: true,
    data: orgStats,
    timestamp: new Date().toISOString(),
  };

  res.json(response);
}));

export default router;