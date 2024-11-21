import express, { Request, Response, RequestHandler } from 'express';
import { ContentProcessor, MarkdownProcessor } from '../services/contentProcessor';
import { RawContent } from '../types/content';

const router = express.Router();


router.post('/submit', async (req: Request, res: Response): Promise<void> => {

  const processor: ContentProcessor = getProcessor(req);

  try {
    const rawContent: RawContent = req.body;
    
    try {
      processor.validateContent(rawContent);
    } catch (error) {
      res.status(400).json({
        error: 'Invalid request',
        details: (error as Error).message
      });
      return;
    }
    
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

function getProcessor(req: Request): ContentProcessor {
  let processor: ContentProcessor;
  if (req.query.source === 'markdown') {
    processor = new MarkdownProcessor();
  } else {
    processor = new ContentProcessor();
  }
  return processor;
}
