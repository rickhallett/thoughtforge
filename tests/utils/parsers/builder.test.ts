import { MarkdownBuilder } from '@thoughtforge/backend/src/utils/markdownParser';

describe('MarkdownBuilder', () => {
  let builder: MarkdownBuilder;

  beforeEach(() => {
    builder = new MarkdownBuilder();
  });

  it('should build document with default values', () => {
    const doc = builder.build();
    expect(doc).toMatchObject({
      title: '',
      content: '',
      meta: {
        tags: [],
      },
    });
    expect(doc.meta.lastUpdated).toBeDefined();
  });

  it('should build document with custom metadata', () => {
    builder = new MarkdownBuilder({ author: 'Test Author' });
    const doc = builder.build();
    expect(doc.meta).toMatchObject({
      author: 'Test Author',
    });
  });

  it('should accumulate content correctly', () => {
    builder.appendContent('line1');
    builder.appendContent('line2');
    builder.appendContent('line3');

    const doc = builder.build();
    expect(doc.content).toBe('line1\nline2\nline3');
  });
});
