import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { HTTP_STATUS } from '../constants';
import { sendErrorResponse } from '../utils/response';
import config from '../config';

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        email: string;
        role: string;
        permissions: string[];
      };
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Get token from header
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Get token from cookie
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Not authenticated');
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };

    // Get user
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');

    if (!user) {
      sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'User not found');
      return;
    }

    if (!user.isActive) {
      sendErrorResponse(res, HTTP_STATUS.FORBIDDEN, 'User account is deactivated');
      return;
    }

    // Attach user to request
    req.user = {
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
      permissions: [], // Will be populated by role middleware
    };

    next();
  } catch (error) {
    if ((error as jwt.JsonWebTokenError).name === 'JsonWebTokenError') {
      sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Invalid token');
      return;
    }
    if ((error as jwt.JsonWebTokenError).name === 'TokenExpiredError') {
      sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Token expired');
      return;
    }
    sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Authentication error');
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Not authenticated');
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendErrorResponse(res, HTTP_STATUS.FORBIDDEN, 'Not authorized to access this route');
      return;
    }

    next();
  };
};

export const checkPermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Not authenticated');
      return;
    }

    const { ROLE_PERMISSIONS } = require('../constants');
    const userPermissions = ROLE_PERMISSIONS[req.user.role as keyof typeof ROLE_PERMISSIONS] || [];

    if (!userPermissions.includes(permission)) {
      sendErrorResponse(res, HTTP_STATUS.FORBIDDEN, `Missing permission: ${permission}`);
      return;
    }

    req.user.permissions = userPermissions;
    next();
  };
};
