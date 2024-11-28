export interface ContentMetadata {
  title: string;
  author?: string;
  dateCreated: Date;
  lastModified: Date;
}

export interface ProcessingOptions {
  enhanceAI: boolean;
  enhanceSEO: boolean;
  standardize: boolean;
}

export interface ProcessingResult {
  success: boolean;
  content: string;
  metadata: ContentMetadata;
  error?: string;
}
