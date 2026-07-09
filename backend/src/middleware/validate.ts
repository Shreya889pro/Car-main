import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { HTTP_STATUS } from '../constants';
import { sendErrorResponse } from '../utils/response';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Check for errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      next();
      return;
    }

    // Format errors
    const formattedErrors = errors.array().map((error) => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
    }));

    sendErrorResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, 'Validation failed', JSON.stringify(formattedErrors));
  };
};
