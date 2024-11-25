import { Router } from 'express';
import { ContentController } from '../controllers/contentController';
import { validateRequest } from '../middlewares/validateRequest';
import { z } from 'zod';

const router = Router();
const contentController = new ContentController();

const contentProcessSchema = z.object({
  content: z.string(),
  type: z.enum(['markdown', 'text', 'html']),
  options: z.object({}).optional(),
});

router.post('/process', validateRequest(contentProcessSchema), contentController.processContent);

export default router;
