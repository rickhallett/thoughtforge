import { Router, Request, Response, NextFunction } from 'express';
import { ContentController } from '../controllers/contentController';
import { validateBody, validateFileUpload } from '../middlewares/validateRequest';
import { z } from 'zod';
import { FileUploadRequest } from '../middlewares/fileUploadHandler';

const router = Router();
const contentController = new ContentController();

const contentProcessSchema = z.object({
  content: z.string(),
  type: z.enum(['markdown', 'text', 'html']),
  options: z.object({}).optional(),
});

const uploadFilesSchema = z.object({
  files: z.array(z.any()),
}).passthrough();

router.post('/process', validateBody(contentProcessSchema), contentController.processContent);

router.post('/upload', validateFileUpload(uploadFilesSchema), contentController.uploadFiles);

export default router;
