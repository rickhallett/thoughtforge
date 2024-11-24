import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(error.message);
  
  return res.status(500).json({
    error: 'Internal Server Error',
    message: error.message,
  });
};
