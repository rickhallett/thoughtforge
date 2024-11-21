import express, { Request, Response, RequestHandler } from 'express';
import { ContentProcessor } from '../services/contentProcessor';
import { RawContent } from '../types/content';

const router = express.Router();
const processor = new ContentProcessor();

router.post('/submit', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawContent: RawContent = req.body;
    
    // Validate input
    if (!rawContent.body) {
      res.status(400).json({ error: 'Content body is required' });
    }
    
    // Process content
    const processed = processor.processContent(rawContent);
    
    res.json({
      message: 'Content processed successfully',
      content: processed
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to process content',
      details: (error as Error).message 
    });
  }
}) as RequestHandler;

export default router;