// Error handler middleware
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = (err as AppError).statusCode || 500;

  // Log full error internally; only expose safe messages to clients
  if (statusCode >= 500) {
    console.error('Server Error:', err);
  }

  // 500 errors never leak internal details
  const message = statusCode >= 500 ? 'Internal server error' : (err.message || 'Unknown error');

  res.status(statusCode).json({
    code: statusCode,
    message,
  });
}

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}