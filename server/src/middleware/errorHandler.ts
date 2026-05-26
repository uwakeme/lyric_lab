// Error handler middleware
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  const statusCode = (err as any).statusCode || 500;
  const message = err.message || 'Internal server error';

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