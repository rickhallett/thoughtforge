import { ContentSource } from '../../types/content';

// Job for initial content ingestion
export interface ContentInputJob {
  contentId: string;
  source: ContentSource;
  raw: {
    // Raw content from source
    content: string;
    metadata?: Record<string, any>;
  };
}

// Job for content processing steps
export interface ContentProcessingJob {
  contentId: string;
  step: ProcessingStep;
  retryCount?: number;
}

// Job for publishing content
export interface PublishingJob {
  contentId: string;
  platforms: PublishingPlatform[];
  options?: {
    schedule?: Date;
    isDraft?: boolean;
    [key: string]: any;
  };
}

// Available processing steps
export type ProcessingStep =
  | 'standardization'
  | 'ai-enhancement'
  | 'seo-optimization'
  | 'ab-generation';

// Supported publishing platforms
export type PublishingPlatform =
  | 'medium'
  | 'substack'
  | 'wix'
  | 'wordpress';