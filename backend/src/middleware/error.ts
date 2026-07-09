import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../constants';
import config from '../config';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
  status?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal Server Error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Validation Error';
  }

  // Mongoose duplicate key
  if ((err as unknown as { code: number }).code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    const field = Object.keys((err as unknown as { keyValue?: Record<string, string> }).keyValue || {})[0];
    message = `${field} already exists`;
  }

  // Mongoose CastError
  if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Invalid ID format';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Token expired';
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    error: message,
    stack: config.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
};

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
