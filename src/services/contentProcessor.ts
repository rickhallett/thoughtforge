import { RawContent, ProcessedContent, isValidSource } from '../types/content';

export class ContentProcessor {
  processContent(raw: RawContent): ProcessedContent {
    return {
      id: Date.now().toString(),
      title: raw.title || 'Untitled',
      body: this.standardizeBody(raw.body),
      source: raw.source,
      createdAt: new Date(),
      status: 'processed'
    };
  }

  validateContent(raw: RawContent): boolean {
    if (!raw.body) {
      throw new Error('Body is required');
    }
    if (!raw.source) {
      throw new Error('Source is required');
    }
    if (!isValidSource(raw.source)) {
      throw new Error('Invalid source');
    }
    return true;
  }

  private standardizeBody(body: string): string {
    // Basic standardization: trim whitespace and normalize line endings
    return body
      .trim()
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n');
  }
}
