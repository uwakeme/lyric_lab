// Auth routes
import { Router, Request, Response } from 'express';
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getUserByEmail,
  createUser,
  getUserById,
} from '../services/authService';
import { authMiddleware } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Register
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  if (!EMAIL_REGEX.test(email)) {
    throw new AppError('Invalid email format', 400);
  }

  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new AppError('Password must contain letters and numbers', 400);
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    throw new AppError('Email already registered', 400);
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser(email, passwordHash);

  res.json({
    code: 0,
    data: { id: user.id, email: user.email },
  });
}));

// Login
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await getUserByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new AppError('Invalid email or password', 401);
  }

  const payload = { userId: user.id, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  res.json({
    code: 0,
    data: { accessToken, refreshToken },
  });
}));

// Refresh token
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    throw new AppError('Invalid refresh token', 401);
  }

  const user = await getUserById(payload.userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const newPayload = { userId: user.id, email: user.email };
  const accessToken = generateAccessToken(newPayload);

  res.json({
    code: 0,
    data: { accessToken },
  });
}));

// Get current user
router.get('/me', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const user = await getUserById(req.user!.userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    code: 0,
    data: { id: user.id, email: user.email },
  });
}));

export default router;
