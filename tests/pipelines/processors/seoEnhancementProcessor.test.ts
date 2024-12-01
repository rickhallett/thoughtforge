import { SEOEnhancementProcessor } from '@thoughtforge/backend/src/pipelines/processors/seoEnhancementProcessor';
import {
  ContentType,
  OutputFormat,
} from '@thoughtforge/backend/src/pipelines/interfaces/contentProcessor';

describe('SEOEnhancementProcessor', () => {
  let processor: SEOEnhancementProcessor;

  beforeEach(() => {
    processor = new SEOEnhancementProcessor();
  });

  it('should process content with keywords', async () => {
    const result = await processor.process('Test content', {
      contentType: ContentType.MARKDOWN,
      targetFormat: OutputFormat.BLOG_POST,
      tags: ['test', 'content'],
    });

    expect(result.metadata.additionalContext?.seoOptimized).toBe(true);
    expect(result.processingNotes).toHaveLength(3);
  });

  it('should handle content without keywords', async () => {
    const result = await processor.process('Test content', {
      contentType: ContentType.MARKDOWN,
      targetFormat: OutputFormat.BLOG_POST,
    });

    expect(result.processingNotes).toContain('No keywords available for SEO optimization');
  });
});
