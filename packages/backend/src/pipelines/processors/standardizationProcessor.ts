import {
  ContentProcessor,
  ProcessingMetadata,
  ProcessingResult,
  ContentType,
  ParsedDocument,
} from '@thoughtforge/backend/src/pipelines/interfaces/contentProcessor';
import { MarkdownParser } from '@thoughtforge/backend/src/utils/markdownParser';


export interface ContentParser {
  parse(content: string): Promise<ParsedDocument>;
}

export class StandardizationProcessor implements ContentProcessor {
  name: string = 'StandardizationProcessor';
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
      content: standardizedContent.content,
      metadata: {
        ...metadata,
        contentType: ContentType.MARKDOWN, // We standardize to markdown
      },
      processingNotes: [`Standardized from ${metadata.contentType} to markdown`],
    };
  }
}
