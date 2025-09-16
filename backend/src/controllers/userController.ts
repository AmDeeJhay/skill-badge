const express = require('express');
const { body: bodyValidator, param: paramValidator, query: queryValidator, validationResult: validateResult } = require('express-validator');

import { asyncHandler } from '@/middleware/errorHandler';
import { UserService } from '@/services/userService';
import { ApiResponse, PaginatedResponse, CreateUserRequest, UpdateUserRequest } from '@/types';

interface Request {
  params: any;
  query: any;
  body: any;
}

interface Response {
  json(data: any): Response;
  status(code: number): Response;
}

const router = express.Router();
const userService = new UserService();

// Validation middleware
const validateUser = [
  bodyValidator('wallet').isString().notEmpty().withMessage('Wallet address is required'),
  bodyValidator('did').isString().notEmpty().withMessage('DID is required'),
  bodyValidator('name').optional().isString().isLength({ max: 100 }),
  bodyValidator('bio').optional().isString().isLength({ max: 500 }),
  bodyValidator('avatarUrl').optional().isURL(),
  bodyValidator('links').optional().isObject(),
];

const validateUpdateUser = [
  bodyValidator('name').optional().isString().isLength({ max: 100 }),
  bodyValidator('bio').optional().isString().isLength({ max: 500 }),
  bodyValidator('avatarUrl').optional().isURL(),
  bodyValidator('links').optional().isObject(),
];

// POST /users - Create or update user
router.post('/', validateUser, asyncHandler(async (req: Request, res: Response) => {
  const errors = validateResult(req);
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
  paramValidator('wallet').isString().notEmpty(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validateResult(req);
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
  paramValidator('wallet').isString().notEmpty(),
  ...validateUpdateUser,
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validateResult(req);
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
  paramValidator('wallet').isString().notEmpty(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validateResult(req);
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
  paramValidator('wallet').isString().notEmpty(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validateResult(req);
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
  queryValidator('page').optional().isInt({ min: 1 }),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
  queryValidator('search').optional().isString(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validateResult(req);
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