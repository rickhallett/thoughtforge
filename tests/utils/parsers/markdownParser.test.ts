import { MarkdownParser } from '../../../src/utils/markdownParser';

describe('MarkdownParser Integration Tests', () => {
  let parser: MarkdownParser;

  beforeEach(() => {
    parser = new MarkdownParser();
  });

  it('should parse a complete markdown document', () => {
    const markdown = `
# My Title

tags: test, markdown, parser

## Content
This is some content.
It has multiple lines.

And paragraphs.
    `;

    const result = parser.parseMarkdown(markdown);

    expect(result).toMatchObject({
      title: 'My Title',
      content: `## Content
This is some content.
It has multiple lines.

And paragraphs.`,
      meta: {
        tags: ['test', 'markdown', 'parser'],
        timeToRead: 1
      }
    });
    expect(result.meta.lastUpdated).toBeDefined();
  });

  it('should parse nested headers in content', () => {
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

    const result = parser.parseMarkdown(markdown);

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
        timeToRead: 1
      }
    });
  });



  it('should handle empty or invalid documents', () => {
    expect(() => parser.parseMarkdown('')).toThrow('Document must have a title');
    expect(() => parser.parseMarkdown('# Title only')).toThrow('Document must have content');
  });

  it('should preserve markdown formatting in content', () => {
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

    const result = parser.parseMarkdown(markdown);
    expect(result.content).toContain('**Bold text**');
    expect(result.content).toContain('- List item');
    expect(result.content).toContain('> Blockquote');
    expect(result.content).toContain('```');
  });
}); 