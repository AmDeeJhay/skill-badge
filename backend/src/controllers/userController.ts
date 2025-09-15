// User controller
import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticateJWT, AuthenticatedRequest } from '@/middleware/auth';
import { UserService } from '@/services/userService';
import { ApiResponse, PaginatedResponse, CreateUserRequest, UpdateUserRequest } from '@/types';
import { logger } from '@/utils/logger';

const router = Router();
const userService = new UserService();

// Validation middleware
const validateUser = [
  body('wallet').isString().notEmpty().withMessage('Wallet address is required'),
  body('did').isString().notEmpty().withMessage('DID is required'),
  body('name').optional().isString().isLength({ max: 100 }),
  body('bio').optional().isString().isLength({ max: 500 }),
  body('avatarUrl').optional().isURL(),
  body('links').optional().isObject(),
];

const validateUpdateUser = [
  body('name').optional().isString().isLength({ max: 100 }),
  body('bio').optional().isString().isLength({ max: 500 }),
  body('avatarUrl').optional().isURL(),
  body('links').optional().isObject(),
];

// POST /users - Create or update user
router.post('/', validateUser, asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
      timestamp: new Date().toISOString(),
    });
  }

  const userData: CreateUserRequest = req.body;
  const user = await userService.createOrUpdateUser(userData);

  const response: ApiResponse = {
    success: true,
    data: user,
    message: 'User created/updated successfully',
    timestamp: new Date().toISOString(),
  };

  res.status(201).json(response);
}));

// GET /users/:wallet - Get user by wallet
router.get('/:wallet', [
  param('wallet').isString().notEmpty(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Invalid wallet address',
      timestamp: new Date().toISOString(),
    });
  }

  const { wallet } = req.params;
  const user = await userService.getUserByWallet(wallet);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
      timestamp: new Date().toISOString(),
    });
  }

  const response: ApiResponse = {
    success: true,
    data: user,
    timestamp: new Date().toISOString(),
  };

  res.json(response);
}));

// PUT /users/:wallet - Update user
router.put('/:wallet', [
  param('wallet').isString().notEmpty(),
  ...validateUpdateUser,
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
      timestamp: new Date().toISOString(),
    });
  }

  const { wallet } = req.params;
  const updateData: UpdateUserRequest = req.body;
  
  const user = await userService.updateUser(wallet, updateData);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
      timestamp: new Date().toISOString(),
    });
  }

  const response: ApiResponse = {
    success: true,
    data: user,
    message: 'User updated successfully',
    timestamp: new Date().toISOString(),
  };

  res.json(response);
}));

// DELETE /users/:wallet - Delete user
router.delete('/:wallet', [
  param('wallet').isString().notEmpty(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Invalid wallet address',
      timestamp: new Date().toISOString(),
    });
  }

  const { wallet } = req.params;
  const deleted = await userService.deleteUser(wallet);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
      timestamp: new Date().toISOString(),
    });
  }

  const response: ApiResponse = {
    success: true,
    message: 'User deleted successfully',
    timestamp: new Date().toISOString(),
  };

  res.json(response);
}));

// GET /users/:wallet/stats - Get user statistics
router.get('/:wallet/stats', [
  param('wallet').isString().notEmpty(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Invalid wallet address',
      timestamp: new Date().toISOString(),
    });
  }

  const { wallet } = req.params;
  const stats = await userService.getUserStats(wallet);

  if (!stats) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
      timestamp: new Date().toISOString(),
    });
  }

  const response: ApiResponse = {
    success: true,
    data: stats,
    timestamp: new Date().toISOString(),
  };

  res.json(response);
}));

// GET /users - Get paginated list of users
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Invalid query parameters',
      timestamp: new Date().toISOString(),
    });
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;

  const result = await userService.getUsers({ page, limit, search });

  const response: PaginatedResponse<any> = {
    success: true,
    data: result.users,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
    timestamp: new Date().toISOString(),
  };

  res.json(response);
}));

export default router;
