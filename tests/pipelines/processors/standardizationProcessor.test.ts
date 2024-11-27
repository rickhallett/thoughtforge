import { StandardizationProcessor } from '../../../src/pipelines/processors/standardizationProcessor';
import { ContentType, OutputFormat } from '../../../src/pipelines/interfaces/contentProcessor';
import { MockContentParser } from '../../utils/mocks/mockContentParser';

describe('StandardizationProcessor', () => {
  let processor: StandardizationProcessor;

  beforeEach(() => {
    processor = new StandardizationProcessor();
    // Inject mock parser
    (processor as any).parsers.set(ContentType.MARKDOWN, new MockContentParser());
  });

  it('should process markdown content successfully', async () => {
    const result = await processor.process('# Test Content', {
      contentType: ContentType.MARKDOWN,
      targetFormat: OutputFormat.BLOG_POST
    });

    expect(result.content).toContain('Standardized:');
    expect(result.metadata.contentType).toBe(ContentType.MARKDOWN);
    expect(result.processingNotes).toHaveLength(1);
  });

  it('should throw error for unsupported content type', async () => {
    await expect(processor.process('Test', {
      contentType: 'unsupported' as ContentType,
      targetFormat: OutputFormat.BLOG_POST
    })).rejects.toThrow('No parser available');
  });
});
