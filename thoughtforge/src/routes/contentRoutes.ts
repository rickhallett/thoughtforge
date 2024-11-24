import { Router } from 'express';
import { ContentController } from '../controllers/contentController';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();
const contentController = new ContentController();

router.post(
  '/process',
  validateRequest(/* add validation schema */),
  contentController.processContent.bind(contentController)
);

export default router;
