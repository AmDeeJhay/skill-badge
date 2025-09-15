// Verification controller
import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticateJWT, AuthenticatedRequest } from '@/middleware/auth';
import { VerificationService } from '@/services/verificationService';
import { ApiResponse, VerifyCredentialRequest } from '@/types';
import { logger } from '@/utils/logger';

const router = Router();
const verificationService = new VerificationService();

// Validation middleware
const validateVerification = [
  body('credentialId').isString().notEmpty().withMessage('Credential ID is required'),
  body('externalVerification').optional().isObject(),
  body('externalVerification.github').optional().isString(),
  body('externalVerification.linkedin').optional().isString(),
];

// POST /verify - Verify credential against external APIs
router.post('/', authenticateJWT, validateVerification, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
      timestamp: new Date().toISOString(),
    });
  }

  const verificationData: VerifyCredentialRequest = req.body;
  const userId = req.user!.id;

  const result = await verificationService.verifyCredential(verificationData, userId);

  const response: ApiResponse = {
    success: true,
    data: result,
    message: 'Verification completed',
    timestamp: new Date().toISOString(),
  };

  res.json(response);
}));

// GET /github/:username - Verify GitHub user skills
router.get('/github/:username', [
  param('username').isString().notEmpty(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Invalid GitHub username',
      timestamp: new Date().toISOString(),
    });
  }

  const { username } = req.params;
  const skill = req.query.skill as string;

  if (!skill) {
    return res.status(400).json({
      success: false,
      error: 'Skill parameter is required',
      timestamp: new Date().toISOString(),
    });
  }

  const result = await verificationService.verifyGitHubSkill(username, skill);

  const response: ApiResponse = {
    success: true,
    data: result,
    timestamp: new Date().toISOString(),
  };

  res.json(response);
}));

// POST /multi-source - Multi-source verification
router.post('/multi-source', authenticateJWT, [
  body('skillName').isString().notEmpty().withMessage('Skill name is required'),
  body('githubUsername').optional().isString(),
  body('linkedinProfileId').optional().isString(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
      timestamp: new Date().toISOString(),
    });
  }

  const { skillName, githubUsername, linkedinProfileId } = req.body;
  const userId = req.user!.id;

  const result = await verificationService.verifyMultiSource(
    skillName,
    githubUsername,
    linkedinProfileId,
    userId
  );

  const response: ApiResponse = {
    success: true,
    data: result,
    message: 'Multi-source verification completed',
    timestamp: new Date().toISOString(),
  };

  res.json(response);
}));

// GET /logs/:userId - Get verification logs for user
router.get('/logs/:userId', authenticateJWT, [
  param('userId').isString().notEmpty(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Invalid user ID',
      timestamp: new Date().toISOString(),
    });
  }

  const { userId } = req.params;
  const currentUserId = req.user!.id;

  // Ensure user can only access their own logs
  if (userId !== currentUserId) {
    return res.status(403).json({
      success: false,
      error: 'Unauthorized access to verification logs',
      timestamp: new Date().toISOString(),
    });
  }

  const logs = await verificationService.getVerificationLogs(userId);

  const response: ApiResponse = {
    success: true,
    data: logs,
    timestamp: new Date().toISOString(),
  };

  res.json(response);
}));

export default router;
