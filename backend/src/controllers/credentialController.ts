// Credential controller
import type { Router, Request, Response } from 'express';
// import type { body, param, query, validationResult } from 'express-validator';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticateJWT, AuthenticatedRequest } from '@/middleware/auth';
import { CredentialService } from '@/services/credentialService';
import { ApiResponse, PaginatedResponse, CreateCredentialRequest } from '@/types';

// Import express and express-validator with require
const express = require('express');
const { body: bodyValidator, param: paramValidator, query: queryValidator, validationResult: validateResult } = require('express-validator');

const router: Router = express.Router();
const credentialService = new CredentialService();

// Validation middleware
const validateCredential = [
  bodyValidator('skill').isString().notEmpty().withMessage('Skill is required'),
  bodyValidator('organization').isString().notEmpty().withMessage('Organization is required'),
  bodyValidator('issuer').isString().notEmpty().withMessage('Issuer is required'),
  bodyValidator('expirationDate').optional().isISO8601().withMessage('Invalid expiration date'),
  bodyValidator('metadata').optional().isObject(),
];

// POST /credentials - Create new credential
router.post('/', authenticateJWT, validateCredential, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validateResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
      timestamp: new Date().toISOString(),
    });
  }

  const credentialData: CreateCredentialRequest = req.body;
  const userId = req.user!.id;

  const credential = await credentialService.createCredential(userId, credentialData);

  const response: ApiResponse = {
    success: true,
    data: credential,
    message: 'Credential created successfully',
    timestamp: new Date().toISOString(),
  };

  res.status(201).json(response);
}));

// GET /credentials/:wallet - Get all user credentials
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
  const credentials = await credentialService.getUserCredentials(wallet);

  const response: ApiResponse = {
    success: true,
    data: credentials,
    timestamp: new Date().toISOString(),
  };

  res.json(response);
}));

// GET /credentials/single/:id - Get single credential
router.get('/single/:id', [
  paramValidator('id').isString().notEmpty(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validateResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Invalid credential ID',
      timestamp: new Date().toISOString(),
    });
  }

  const { id } = req.params;
  const credential = await credentialService.getCredentialById(id);

  if (!credential) {
    return res.status(404).json({
      success: false,
      error: 'Credential not found',
      timestamp: new Date().toISOString(),
    });
  }

  const response: ApiResponse = {
    success: true,
    data: credential,
    timestamp: new Date().toISOString(),
  };

  res.json(response);
}));

// PUT /credentials/:id - Update credential
router.put('/:id', authenticateJWT, [
  paramValidator('id').isString().notEmpty(),
  ...validateCredential,
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validateResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
      timestamp: new Date().toISOString(),
    });
  }

  const { id } = req.params;
  const updateData: CreateCredentialRequest = req.body;
  const userId = req.user!.id;

  const credential = await credentialService.updateCredential(id, userId, updateData);

  if (!credential) {
    return res.status(404).json({
      success: false,
      error: 'Credential not found or unauthorized',
      timestamp: new Date().toISOString(),
    });
  }

  const response: ApiResponse = {
    success: true,
    data: credential,
    message: 'Credential updated successfully',
    timestamp: new Date().toISOString(),
  };

  res.json(response);
}));

// DELETE /credentials/:id - Delete credential
router.delete('/:id', authenticateJWT, [
  paramValidator('id').isString().notEmpty(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validateResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Invalid credential ID',
      timestamp: new Date().toISOString(),
    });
  }

  const { id } = req.params;
  const userId = req.user!.id;

  const deleted = await credentialService.deleteCredential(id, userId);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: 'Credential not found or unauthorized',
      timestamp: new Date().toISOString(),
    });
  }

  const response: ApiResponse = {
    success: true,
    message: 'Credential deleted successfully',
    timestamp: new Date().toISOString(),
  };

  res.json(response);
}));

// POST /credentials/batch-verify - Bulk verification
router.post('/batch-verify', authenticateJWT, [
  bodyValidator('credentialIds').isArray().withMessage('Credential IDs must be an array'),
  bodyValidator('credentialIds.*').isString().withMessage('Each credential ID must be a string'),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validateResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
      timestamp: new Date().toISOString(),
    });
  }

  const { credentialIds } = req.body;
  const userId = req.user!.id;

  const results = await credentialService.batchVerifyCredentials(credentialIds, userId);

  const response: ApiResponse = {
    success: true,
    data: results,
    message: 'Batch verification completed',
    timestamp: new Date().toISOString(),
  };

  res.json(response);
}));

// POST /credentials/:id/revoke - Revoke credential
router.post('/:id/revoke', authenticateJWT, [
  paramValidator('id').isString().notEmpty(),
  bodyValidator('reason').optional().isString(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validateResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      timestamp: new Date().toISOString(),
    });
  }

  const { id } = req.params;
  const { reason } = req.body;
  const userId = req.user!.id;

  const revoked = await credentialService.revokeCredential(id, userId, reason);

  if (!revoked) {
    return res.status(404).json({
      success: false,
      error: 'Credential not found or unauthorized',
      timestamp: new Date().toISOString(),
    });
  }

  const response: ApiResponse = {
    success: true,
    message: 'Credential revoked successfully',
    timestamp: new Date().toISOString(),
  };

  res.json(response);
}));

// GET /credentials/status/:id - Get credential status
router.get('/status/:id', [
  paramValidator('id').isString().notEmpty(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validateResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Invalid credential ID',
      timestamp: new Date().toISOString(),
    });
  }

  const { id } = req.params;
  const status = await credentialService.getCredentialStatus(id);

  if (!status) {
    return res.status(404).json({
      success: false,
      error: 'Credential not found',
      timestamp: new Date().toISOString(),
    });
  }

  const response: ApiResponse = {
    success: true,
    data: { status },
    timestamp: new Date().toISOString(),
  };

  res.json(response);
}));

export default router;