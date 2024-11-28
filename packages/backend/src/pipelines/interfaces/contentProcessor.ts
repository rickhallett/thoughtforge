export interface ContentProcessor {
  process(content: string, metadata?: ProcessingMetadata): Promise<ProcessingResult>;
}

export interface ProcessingMetadata {
  contentType: ContentType;
  targetFormat: OutputFormat;
  tags?: string[];
  additionalContext?: Record<string, unknown>;
}

export interface ProcessingResult {
  content: string;
  metadata: ProcessingMetadata;
  processingNotes?: string[];
}

export enum ContentType {
  MARKDOWN = 'markdown',
  HTML = 'html',
  PLAIN_TEXT = 'plain_text',
  PDF = 'pdf',
  DOCX = 'docx'
}

export enum OutputFormat {
  BLOG_POST = 'blog_post',
  TECHNICAL_ARTICLE = 'technical_article',
  REFERENCE_DOC = 'reference_doc',
  TUTORIAL = 'tutorial'
}
