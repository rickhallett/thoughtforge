import { ContentPipeline } from '@thoughtforge/backend/src/pipelines/contentPipeline';
import {
  ContentType,
  OutputFormat,
} from '@thoughtforge/backend/src/pipelines/interfaces/contentProcessor';

describe('ContentPipeline Integration', () => {
  let pipeline: ContentPipeline;

  beforeEach(() => {
    pipeline = new ContentPipeline();
  });

  it('should process content through entire pipeline', async () => {
    const result = await pipeline.process('# Title\n\n## Content \n Stuff stuff stuff', {
      contentType: ContentType.MARKDOWN,
      targetFormat: OutputFormat.BLOG_POST,
      tags: ['test'],
    });

    expect(result.content).toBeDefined();
    expect(result.metadata.contentType).toBe(ContentType.MARKDOWN);
    expect(result.metadata.additionalContext?.aiEnhanced).toBe(true);
    expect(result.metadata.additionalContext?.seoOptimized).toBe(true);
    expect(result.processingNotes?.length).toBeGreaterThan(0);
  });

  it('should maintain processing order', async () => {
    const result = await pipeline.process('# Title\n\n## Content \n Stuff stuff stuff', {
      contentType: ContentType.MARKDOWN,
      targetFormat: OutputFormat.BLOG_POST,
    });

    const notes = result.processingNotes || [];
    expect(notes[0]).toContain('Standardized');
    expect(notes[1]).toContain('AI enhancement');
    expect(notes[3]).toContain('SEO optimization');
  });
});
