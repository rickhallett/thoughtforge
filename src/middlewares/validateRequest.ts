import { Request, Response, NextFunction } from 'express';

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);

    if (error) {
      res.status(400).json({
        error: 'Validation Error',
        details: error.details,
      });
      return;
    }

    next();
  };
};
