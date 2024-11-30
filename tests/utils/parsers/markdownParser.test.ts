import { MarkdownParser } from '@thoughtforge/backend/src/utils/markdownParser';

describe('MarkdownParser Integration Tests', () => {
  let parser: MarkdownParser;

  beforeEach(() => {
    parser = new MarkdownParser();
  });

  it('should parse a complete markdown document', async () => {
    const markdown = `
# My Title

tags: test, markdown, parser

## Content
This is some content.
It has multiple lines.

And paragraphs.
    `;

    const result = await parser.parse(markdown);

    expect(result).toMatchObject({
      title: 'My Title',
      content: `## Content
This is some content.
It has multiple lines.

And paragraphs.`,
      meta: {
        tags: ['test', 'markdown', 'parser'],
        timeToRead: 1,
      },
    });
    // expect(result.meta.lastUpdated).toBeDefined(); // TODO: add this back
  });

  it('should parse nested headers in content', async () => {
    const markdown = `
# Main Title

tags: test

## Content
Main content text.
### Subsection
Subsection content.
#### Nested
Deeply nested content.
`;

    const result = await parser.parse(markdown);

    expect(result).toMatchObject({
      title: 'Main Title',
      content: `## Content
Main content text.
### Subsection
Subsection content.
#### Nested
Deeply nested content.`,
      meta: {
        tags: ['test'],
        timeToRead: 1,
      },
    });
  });

  it('should handle empty or invalid documents', async () => {
    expect(async () => await parser.parse('')).rejects.toThrow('Document must have a title');
    expect(async () => await parser.parse('# Title only')).rejects.toThrow(
      'Document must have content'
    );
  });

  it('should preserve markdown formatting in content', async () => {
    const markdown = `
# Title

## Content
**Bold text**
- List item 1
- List item 2

### Subsection
> Blockquote
\`\`\`
code block
\`\`\`
`;

    const result = await parser.parse(markdown);
    expect(result.content).toContain('**Bold text**');
    expect(result.content).toContain('- List item');
    expect(result.content).toContain('> Blockquote');
    expect(result.content).toContain('```');
  });
});
