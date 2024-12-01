import { ContentPipeline } from '@thoughtforge/backend/src/pipelines/contentPipeline';
import {
  ContentType,
  OutputFormat,
} from '@thoughtforge/backend/src/pipelines/interfaces/contentProcessor';
import { AIEnhancementProcessor } from '@thoughtforge/backend/src/pipelines/processors/aiEnhancementProcessor';

describe('ContentPipeline Integration', () => {
  let pipeline: ContentPipeline;

  beforeEach(() => {
    pipeline = new ContentPipeline();
  });

  describe('Basic Processing', () => {
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

  describe('Error Handling', () => {
    it('should handle processor failures gracefully', async () => {
      // Mock one processor to throw an error
      jest.spyOn(AIEnhancementProcessor.prototype, 'process').mockRejectedValueOnce(new Error('AI Service unavailable'));

      await expect(pipeline.process('# Test\n\n## Content\nContent', {
        contentType: ContentType.MARKDOWN,
        targetFormat: OutputFormat.BLOG_POST,
      })).rejects.toThrow('AI Service unavailable');
    });

    it('should handle invalid metadata', async () => {
      await expect(pipeline.process('content', {
        contentType: 'invalid' as ContentType,
        targetFormat: OutputFormat.BLOG_POST,
      })).rejects.toThrow();
    });
  });

  describe('Data Transformations', () => {
    it('should preserve metadata through the pipeline', async () => {
      const metadata = {
        contentType: ContentType.MARKDOWN,
        targetFormat: OutputFormat.BLOG_POST,
        tags: ['test'],
        additionalContext: { custom: 'value' }
      };

      const result = await pipeline.process('# Test\n\n## Content\nContent', metadata);
      expect(result.metadata.tags).toEqual(['test']);
      expect(result.metadata.additionalContext).toHaveProperty('custom');
    });

    it('should accumulate processing notes from all processors', async () => {
      const result = await pipeline.process('# Test\n\n## Content\nContent', {
        contentType: ContentType.MARKDOWN,
        targetFormat: OutputFormat.BLOG_POST,
      });

      expect(result.processingNotes).toContain('Standardized from markdown to markdown');
      expect(result.processingNotes?.some(note => note.includes('AI enhancement'))).toBe(true);
      expect(result.processingNotes?.some(note => note.includes('SEO'))).toBe(true);
    });
  });

  describe('Format Handling', () => {
    it.each([
      [OutputFormat.BLOG_POST],
      [OutputFormat.TECHNICAL_ARTICLE],
      [OutputFormat.TUTORIAL],
    ])('should properly format content for %s', async (format) => {
      const result = await pipeline.process('# Test\n\n## Content\nContent', {
        contentType: ContentType.MARKDOWN,
        targetFormat: format,
      });
      expect(result.metadata.targetFormat).toBe(format);
      expect(result.content).toBeDefined(); // TODO: Add more specific content checks
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', async () => {
      await expect(pipeline.process('', {
        contentType: ContentType.MARKDOWN,
        targetFormat: OutputFormat.BLOG_POST,
      })).rejects.toThrow();
    });

    it('should handle very large content', async () => {
      const largeContent = '# Title\n\n## Content\n' + 'x'.repeat(100000);
      const result = await pipeline.process(largeContent, {
        contentType: ContentType.MARKDOWN,
        targetFormat: OutputFormat.BLOG_POST,
      });
      expect(result.content).toBeDefined();
      expect(result.content.length).toBeGreaterThan(1000);
    });

    it('should handle special characters', async () => {
      const specialContent = '# Title\n\n## Content\n🚀 Unicode & <special> chars';
      const result = await pipeline.process(specialContent, {
        contentType: ContentType.MARKDOWN,
        targetFormat: OutputFormat.BLOG_POST,
      });
      expect(result.content).toContain('🚀');
      expect(result.content).toContain('<special>');
    });
  });

  describe('Performance', () => {
    it('should process content within acceptable time', async () => {
      const start = Date.now();
      await pipeline.process('# Test\n\n## Content\nContent', {
        contentType: ContentType.MARKDOWN,
        targetFormat: OutputFormat.BLOG_POST,
      });
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // 1 second max
    });
  });
});
