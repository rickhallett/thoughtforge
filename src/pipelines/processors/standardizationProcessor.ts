import { ContentProcessor, ProcessingMetadata, ProcessingResult, ContentType } from '../interfaces/contentProcessor';
import { MarkdownParser } from '../../utils/markdownParser';

export class StandardizationProcessor implements ContentProcessor {
  private parsers: Map<ContentType, ContentParser>;

  constructor() {
    this.parsers = new Map([
      [ContentType.MARKDOWN, new MarkdownParser()],
      // Add other parsers as needed for HTML, PDF, etc.
    ]);
  }

  async process(content: string, metadata: ProcessingMetadata): Promise<ProcessingResult> {
    const parser = this.parsers.get(metadata.contentType);
    if (!parser) {
      throw new Error(`No parser available for content type: ${metadata.contentType}`);
    }

    const standardizedContent = await parser.parse(content);
    
    return {
      content: standardizedContent,
      metadata: {
        ...metadata,
        contentType: ContentType.MARKDOWN // We standardize to markdown
      },
      processingNotes: [`Standardized from ${metadata.contentType} to markdown`]
    };
  }
}

interface ContentParser {
  parse(content: string): Promise<string>;
}
