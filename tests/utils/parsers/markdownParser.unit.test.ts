import { MarkdownParser } from '@thoughtforge/backend/src/utils/markdownParser';
import { ParsedDocument } from '@thoughtforge/backend/src/pipelines/interfaces/contentProcessor';

describe('MarkdownParser Unit Tests', () => {
  let parser: MarkdownParser;

  beforeEach(() => {
    parser = new MarkdownParser();
  });

  describe('Pre-processing Hooks', () => {
    it('should normalize line endings', async () => {
      const markdown = "# Title\r\n\r\n## Content\r\nTest";
      const result = await parser.parse(markdown);
      expect(result.content).not.toContain('\r\n');
    });

    it('should handle multiple consecutive empty lines', async () => {
      const markdown = `# Title


      ## Content

      
      Test content`;
      const result = await parser.parse(markdown);
      expect(result.content).not.toMatch(/\n\s*\n\s*\n/);
    });

    it('should normalize header spacing', async () => {
      const markdown = `#Tight Title

##Content
Test`;
      const result = await parser.parse(markdown);
      expect(result.title).toBe('Tight Title');
      expect(result.content).toContain('## Content');
    });
  });

  describe('Meta Information', () => {
    // TODO: Add this back in once we have a way to calculate reading time
    it.skip('should calculate correct reading time for different content lengths', async () => {
      const shortContent = `# Title\n\n## Content\n${Array(50).fill('word').join(' ')}`;
      const longContent = `# Title\n\n## Content\n${Array(500).fill('word').join(' ')}`;

      const shortResult = await parser.parse(shortContent);
      const longResult = await parser.parse(longContent);

      expect(shortResult.meta.timeToRead).toBe(1);
      expect(longResult.meta.timeToRead).toBe(3); // 500 words / 200 words per minute = 2.5, rounded up to 3
    });
  });

  describe('Content Section Handling', () => {
    it('should handle multiple content sections correctly', async () => {
      const markdown = `# Title

## Content
First section

## Another Section
Should not be included

## Content
Second content section`;

      const result = await parser.parse(markdown);
      expect(result.content).toContain('First section');
      expect(result.content).not.toContain('Should not be included');
      expect(result.content).toContain('Second content section');
    });

    it('should preserve indentation in code blocks', async () => {
      const markdown = `# Title

## Content
\`\`\`typescript
function test() {
    const x = 1;
    return x;
}
\`\`\``;

      const result = await parser.parse(markdown);
      expect(result.content).toMatch(/    const x = 1;/);
    });
  });

  describe('Error Cases', () => {
    it('should handle malformed tags gracefully', async () => {
      const markdown = `# Title\n\ntags: ,,,\n\n## Content\nTest`;
      const result = await parser.parse(markdown);
      expect(result.meta.tags).toEqual([]);
    });

    it('should handle unicode characters correctly', async () => {
      const markdown = `# Title 📚

## Content
Test with emoji 🎉 and unicode characters: 你好, Café`;

      const result = await parser.parse(markdown);
      expect(result.content).toContain('🎉');
      expect(result.content).toContain('你好');
      expect(result.content).toContain('Café');
    });

    it('should handle missing metadata gracefully', async () => {
      const markdown = `# Title\n\n## Content\nNo tags here`;
      const result = await parser.parse(markdown);
      expect(result.meta.tags).toEqual([]);
      expect(result.meta.timeToRead).toBeDefined();
    });
  });

  describe('Parser Configuration', () => {
    it('should allow custom pre-process hooks', async () => {
      const customHook = (markdown: string) => markdown.replace(/TEST/g, 'PROCESSED');
      const customParser = new MarkdownParser({
        preProcessHooks: [customHook]
      });

      const markdown = `# Title\n\n## Content\nTEST content`;
      const result = await customParser.parse(markdown);
      expect(result.content).toContain('PROCESSED content');
    });

    it('should allow custom post-process hooks', async () => {
      const customHook = (doc: ParsedDocument) => ({
        ...doc,
        meta: { ...doc.meta, custom: 'value' }
      });
      const customParser = new MarkdownParser({
        postProcessHooks: [customHook]
      });

      const markdown = `# Title\n\n## Content\nTest`;
      const result = await customParser.parse(markdown);
      expect(result.meta).toHaveProperty('custom', 'value');
    });
  });
});
