import { StandardizationProcessor } from '@thoughtforge/backend/src/pipelines/processors/standardizationProcessor';
import {
  ContentType,
  OutputFormat,
} from '@thoughtforge/backend/src/pipelines/interfaces/contentProcessor';
import { MockContentParser } from '../../utils/mocks/mockContentParser';
import { MarkdownParser } from '@thoughtforge/backend/src/utils/markdownParser';

jest.mock('@thoughtforge/backend/src/utils/markdownParser', () => {
  return {
    MarkdownParser: jest.fn().mockImplementation(() => ({
      parse: jest.fn().mockResolvedValue({
        title: 'Mock Title',
        content: 'Mock Content',
        meta: {
          tags: ['mock'],
          timeToRead: 1
        },
        type: 'markdown'
      })
    }))
  };
});

describe('StandardizationProcessor', () => {
  let processor: StandardizationProcessor;

  beforeEach(() => {
    processor = new StandardizationProcessor();
    // Inject mock parser
    // (processor as any).parsers.set(ContentType.MARKDOWN, new MockContentParser());
    (processor as any).parsers.set(ContentType.MARKDOWN, new MarkdownParser());
  });

  it('should process markdown content successfully', async () => {
    const result = await processor.process('# Test Content', {
      contentType: ContentType.MARKDOWN,
      targetFormat: OutputFormat.BLOG_POST,
    });

    expect(result.processingNotes).toContain('Standardized from markdown to markdown');
    expect(result.metadata.contentType).toBe(ContentType.MARKDOWN);
    expect(result.processingNotes).toHaveLength(1);
  });

  it('should throw error for unsupported content type', async () => {
    await expect(
      processor.process('Test', {
        contentType: 'unsupported' as ContentType,
        targetFormat: OutputFormat.BLOG_POST,
      })
    ).rejects.toThrow('No parser available');
  });
});
