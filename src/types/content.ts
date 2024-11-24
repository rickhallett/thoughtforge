export enum ContentSource {
  MANUAL = 'manual',
  MARKDOWN = 'markdown',
  EMAIL = 'email',
  WEB = 'web',
  VOICE = 'voice'
}

export interface RawContent {
  title?: string;
  body: string;
  source: ContentSource;
}

export interface BaseContent {
  id: string;
  title: string;
  body: string;
  source: ContentSource;
  createdAt: Date;
  updatedAt: Date;
  status: ContentStatus;
  metadata: ContentMetadata;
}

export type ContentStatus =
  | 'received'      // Initial state
  | 'standardized'  // Standardized
  | 'processing'    // Being processed
  | 'processed'     // Processing completed 
  | 'failed'        // Processing failed
  | 'ready'         // Ready for publishing
  | 'published';    // Successfully published

export interface ContentMetadata {
  // Source-specific metadata
  sourceUrl?: string;      // For web clippings
  emailFrom?: string;      // For email sources
  emailSubject?: string;   // For email sources
  audioLength?: number;    // For voice notes
  fileSize?: number;       // For any file-based input
  mimeType?: string;      // For any file-based input

  // Processing metadata
  processingSteps?: string[];
  aiEnhanced?: boolean;
  seoOptimized?: boolean;

  // Publishing metadata
  publishedUrls?: string[];
  publishedPlatforms?: string[];

  // Custom metadata
  [key: string]: any;
}

export function isValidSource(source: string): source is ContentSource {
  return Object.values(ContentSource).includes(source as ContentSource);
}