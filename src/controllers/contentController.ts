import { Request, Response } from 'express';
import { ContentService } from '../services/contentService';

export class ContentController {
  private contentService: ContentService;

  constructor() {
    this.contentService = new ContentService();
  }

  async processContent(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.contentService.processContent(req.body.content);
      res.json(result);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
