import { AIEnhancementProcessor } from '@thoughtforge/backend/src/pipelines/processors/aiEnhancementProcessor';
import {
  ContentType,
  OutputFormat,
} from '@thoughtforge/backend/src/pipelines/interfaces/contentProcessor';

describe('AIEnhancementProcessor', () => {
  let processor: AIEnhancementProcessor;

  beforeEach(() => {
    processor = new AIEnhancementProcessor();
  });

  it('should process content with valid template', async () => {
    const result = await processor.process('Test content', {
      contentType: ContentType.MARKDOWN,
      targetFormat: OutputFormat.BLOG_POST,
    });

    expect(result.metadata.additionalContext?.aiEnhanced).toBe(true);
    expect(result.processingNotes).toHaveLength(2);
  });

  it('should throw error for unsupported format', async () => {
    await expect(
      processor.process('Test', {
        contentType: ContentType.MARKDOWN,
        targetFormat: 'unsupported' as OutputFormat,
      })
    ).rejects.toThrow('No prompt template available');
  });
});
