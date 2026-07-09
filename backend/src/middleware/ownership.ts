import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { HTTP_STATUS } from '../constants';
import { sendErrorResponse } from '../utils/response';

export const checkOwnership = (paramName: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const resourceUserId = req.params[paramName];
    const currentUserId = req.user?._id;

    if (!currentUserId) {
      sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Not authenticated');
      return;
    }

    // Allow super admins to access any resource
    if (req.user?.role === 'super_admin') {
      next();
      return;
    }

    // Check if the user is accessing their own resource
    if (resourceUserId === currentUserId) {
      next();
      return;
    }

    sendErrorResponse(res, HTTP_STATUS.FORBIDDEN, 'Not authorized to access this resource');
  };
};

export const checkModelOwnership = (Model: any, paramName: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resourceId = req.params[paramName];
      const currentUserId = req.user?._id;

      if (!currentUserId) {
        sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Not authenticated');
        return;
      }

      // Allow super admins to access any resource
      if (req.user?.role === 'super_admin') {
        next();
        return;
      }

      const resource = await Model.findById(resourceId);

      if (!resource) {
        sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Resource not found');
        return;
      }

      // Check if the user owns the resource
      if (resource.user?.toString() === currentUserId.toString()) {
        next();
        return;
      }

      sendErrorResponse(res, HTTP_STATUS.FORBIDDEN, 'Not authorized to access this resource');
    } catch (error) {
      sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error checking ownership');
    }
  };
};
