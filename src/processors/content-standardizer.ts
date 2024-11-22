// src/processors/standardizer.ts
import { logger } from '../lib/logger/logger';
import { ProcessedContent, ContentSource } from '../types/content';
import { ContentInputJob } from '../lib/queue/types';

export class ContentStandardizer {
  async process(job: ContentInputJob): Promise<ProcessedContent> {
    logger.debug('Starting content standardization', {
      contentId: job.contentId,
      source: job.source
    });

    try {
      const standardContent = await this.standardizeContent(
        job.contentId,
        job.source,
        job.raw
      );

      logger.info('Content standardized successfully', {
        contentId: job.contentId
      });

      return standardContent;

    } catch (error) {
      logger.error('Content standardization failed', {
        contentId: job.contentId,
        error
      });
      throw error;
    }
  }

  private async standardizeContent(
    contentId: string,
    source: ContentSource,
    raw: { content: string; metadata?: Record<string, any> }
  ): Promise<ProcessedContent> {
    // Base content structure
    const standardContent: ProcessedContent = {
      id: contentId,
      title: '',  // Will be set based on source
      body: raw.content,
      source,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'processing',
      metadata: {
        ...raw.metadata,
        originalSource: source,
        processingSteps: ['standardization']
      }
    };

    // Source-specific processing
    switch (source) {
      case 'email':
        return this.standardizeEmailContent(standardContent, raw);
      case 'web':
        return this.standardizeWebContent(standardContent, raw);
      case 'voice':
        return this.standardizeVoiceContent(standardContent, raw);
      case 'manual':
        return this.standardizeManualContent(standardContent, raw);
      default:
        throw new Error(`Unsupported content source: ${source}`);
    }
  }

  private async standardizeEmailContent(
    content: ProcessedContent,
    raw: { content: string; metadata?: Record<string, any> }
  ): Promise<ProcessedContent> {
    content.title = raw.metadata?.emailSubject || 'Untitled Email';
    content.metadata = {
      ...content.metadata,
      emailFrom: raw.metadata?.from,
      emailSubject: raw.metadata?.emailSubject,
      emailDate: raw.metadata?.date
    };
    return content;
  }

  private async standardizeWebContent(
    content: ProcessedContent,
    raw: { content: string; metadata?: Record<string, any> }
  ): Promise<ProcessedContent> {
    content.title = raw.metadata?.pageTitle || 'Web Clipping';
    content.metadata = {
      ...content.metadata,
      sourceUrl: raw.metadata?.url,
      originalHtml: raw.metadata?.html
    };
    return content;
  }

  private async standardizeVoiceContent(
    content: ProcessedContent,
    raw: { content: string; metadata?: Record<string, any> }
  ): Promise<ProcessedContent> {
    content.title = raw.metadata?.title || 'Voice Note';
    content.metadata = {
      ...content.metadata,
      audioLength: raw.metadata?.duration,
      audioFormat: raw.metadata?.format,
      transcriptionConfidence: raw.metadata?.confidence
    };
    return content;
  }

  private async standardizeManualContent(
    content: ProcessedContent,
    raw: { content: string; metadata?: Record<string, any> }
  ): Promise<ProcessedContent> {
    content.title = raw.metadata?.title || 'Manual Entry';
    content.metadata = {
      ...content.metadata,
      author: raw.metadata?.author
    };
    return content;
  }

  private async standardizeMarkdownContent(
    content: ProcessedContent,
    raw: { content: string; metadata?: Record<string, any> }
  ): Promise<ProcessedContent> {
    content.title = raw.metadata?.title || 'Markdown Clipping';
    content.metadata = {
      ...content.metadata,
      originalMarkdown: raw.content
    };
    return content;
  }
}
