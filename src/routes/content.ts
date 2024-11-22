import express, { Request, Response, RequestHandler } from 'express';
import { RawContent } from '../types/content';

const router = express.Router();


router.post('/submit', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawContent: RawContent = req.body;

    res.json({
      message: 'Content processed successfully',
      content: rawContent
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to process content',
      details: (error as Error).message
    });
  }
}) as RequestHandler;

export default router;
