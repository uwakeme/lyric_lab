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

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
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
  } catch (err) {
    const statusCode = (err as AppError).statusCode || 500;
    res.status(statusCode).json({
      code: statusCode,
      message: (err as Error).message,
    });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
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
  } catch (err) {
    const statusCode = (err as AppError).statusCode || 500;
    res.status(statusCode).json({
      code: statusCode,
      message: (err as Error).message,
    });
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
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
  } catch (err) {
    const statusCode = (err as AppError).statusCode || 500;
    res.status(statusCode).json({
      code: statusCode,
      message: (err as Error).message,
    });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await getUserById(req.user!.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      code: 0,
      data: { id: user.id, email: user.email },
    });
  } catch (err) {
    const statusCode = (err as AppError).statusCode || 500;
    res.status(statusCode).json({
      code: statusCode,
      message: (err as Error).message,
    });
  }
});

export default router;