// Version routes for authenticated users
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();
const router = Router();

router.use(authMiddleware);

// Get all versions for current user
router.get('/', async (req: Request, res: Response) => {
  try {
    const versions = await prisma.userVersion.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        label: true,
        createdAt: true,
        songId: true,
      },
    });

    res.json({
      code: 0,
      data: versions,
    });
  } catch (err) {
    const statusCode = (err as AppError).statusCode || 500;
    res.status(statusCode).json({
      code: statusCode,
      message: (err as Error).message,
    });
  }
});

// Create new version
router.post('/', async (req: Request, res: Response) => {
  try {
    const { songId, content, label } = req.body;

    const version = await prisma.userVersion.create({
      data: {
        userId: req.user!.userId,
        songId: songId || null,
        content,
        label: label || '未命名版本',
      },
    });

    res.json({
      code: 0,
      data: { id: version.id, label: version.label, createdAt: version.createdAt },
    });
  } catch (err) {
    const statusCode = (err as AppError).statusCode || 500;
    res.status(statusCode).json({
      code: statusCode,
      message: (err as Error).message,
    });
  }
});

// Get version by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const version = await prisma.userVersion.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
    });

    if (!version) {
      throw new AppError('Version not found', 404);
    }

    res.json({
      code: 0,
      data: version,
    });
  } catch (err) {
    const statusCode = (err as AppError).statusCode || 500;
    res.status(statusCode).json({
      code: statusCode,
      message: (err as Error).message,
    });
  }
});

// Delete version
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const version = await prisma.userVersion.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
    });

    if (!version) {
      throw new AppError('Version not found', 404);
    }

    await prisma.userVersion.delete({
      where: { id },
    });

    res.json({
      code: 0,
      data: { success: true },
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