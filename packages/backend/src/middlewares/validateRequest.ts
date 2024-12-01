import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { FileUploadRequest } from '@thoughtforge/shared/src/types/fileUpload';

// Regular request validator (for JSON/form data)
export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.safeParse(req.body);

    if (error) {
      res.status(400).json({
        error: 'Validation Error',
        details: error.errors,
      });
      return;
    }
    next();
  };
};

// File upload request validator
export const validateFileUpload = (schema: z.ZodSchema) => {
  return (req: Request & FileUploadRequest, res: Response, next: NextFunction) => {
    console.log('req.files', req.files);
    console.log('req.body', req.body);

    const dataToValidate = {
      ...req.body,
      files: req.files,
    };

    const { error } = schema.safeParse(dataToValidate);

    if (error) {
      res.status(400).json({
        error: 'Validation Error',
        details: error.errors,
      });
      return;
    }
    next();
  };
};
