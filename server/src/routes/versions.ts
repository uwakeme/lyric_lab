// Version routes for authenticated users
import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

// Get all versions for current user
router.get('/', asyncHandler(async (req, res) => {
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

  res.json({ code: 0, data: versions });
}));

// Create new version
router.post('/', asyncHandler(async (req, res) => {
  const { songId, content, label } = req.body;

  // Validate content size (max 1MB when stringified)
  const contentStr = JSON.stringify(content);
  if (contentStr.length > 1_000_000) {
    throw new AppError('Content too large', 400);
  }

  const version = await prisma.userVersion.create({
    data: {
      userId: req.user!.userId,
      songId: songId || null,
      content,
      label: (typeof label === 'string' ? label.slice(0, 100) : null) || '未命名版本',
    },
  });

  res.json({ code: 0, data: { id: version.id, label: version.label, createdAt: version.createdAt } });
}));

// Get version by ID
router.get('/:id', asyncHandler(async (req, res) => {
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

  res.json({ code: 0, data: version });
}));

// Delete version
router.delete('/:id', asyncHandler(async (req, res) => {
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

  await prisma.userVersion.delete({ where: { id } });
  res.json({ code: 0, data: { success: true } });
}));

export default router;
