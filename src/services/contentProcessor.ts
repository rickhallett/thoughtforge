import { RawContent, ProcessedContent, isValidSource } from '../types/content';

export class ContentProcessor {
  processContent(raw: RawContent): ProcessedContent {
    return {
      id: Date.now().toString(),
      title: raw.title || 'Untitled',
      body: this.standardizeBody(raw.body),
      source: raw.source,
      createdAt: new Date(),
      updatedAt: new Date(),
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

export class MarkdownProcessor extends ContentProcessor {
  processContent(raw: RawContent): ProcessedContent {
    return super.processContent(raw);
  }

  validateContent(raw: RawContent): boolean {
    super.validateContent(raw);
    
    if (!this.isValidMarkdownFormat(raw.body)) {
      throw new Error('Invalid markdown format. Expected: # Title, ## Original Points, ## Conclusion');
    }

    return true;
  }

  private isValidMarkdownFormat(markdown: string): boolean {
    const sections = markdown.split('\n').map(line => line.trim());
    
    // Check for required headers
    const hasTitle = sections.some(line => /^# .+/.test(line));
    const hasOriginalPoints = sections.some(line => /^## Original Points/.test(line));
    const hasConclusion = sections.some(line => /^## Conclusion/.test(line));

    return hasTitle && hasOriginalPoints && hasConclusion;
  }
}