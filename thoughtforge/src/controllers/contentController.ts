import { Request, Response } from 'express';
import { ContentService } from '../services/contentService';

export class ContentController {
  private contentService: ContentService;

  constructor() {
    this.contentService = new ContentService();
  }

  async processContent(req: Request, res: Response) {
    try {
      const result = await this.contentService.processContent(req.body.content);
      return res.json(result);
    } catch (error) {
      throw error;
    }
  }
}
