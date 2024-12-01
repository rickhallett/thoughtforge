import {
  TitleParser,
  TagsParser,
  ContentSectionParser,
  MarkdownBuilder,
} from '@thoughtforge/backend/src/utils/markdownParser';

describe('Parser Strategies', () => {
  describe('TitleParser', () => {
    let parser: TitleParser;
    let builder: MarkdownBuilder;

    beforeEach(() => {
      parser = new TitleParser();
      builder = new MarkdownBuilder();
    });

    it('should handle basic title cases', () => {
      expect(parser.canParse('# Title')).toBe(true);
      expect(parser.canParse('Not a title')).toBe(false);
    });

    it('should handle edge cases', () => {
      // Empty or malformed titles
      expect(parser.canParse('#')).toBe(false);
      expect(parser.canParse('# ')).toBe(false);
      expect(parser.canParse('#Title')).toBe(false); // No space after #
      expect(parser.canParse('# \t')).toBe(false); // Only whitespace after #
      expect(parser.canParse('# \n')).toBe(false); // Newline after #
      expect(parser.canParse('# \r\n')).toBe(false); // CRLF after #

      // Multiple spaces after #
      expect(parser.canParse('#    Multiple Spaces')).toBe(true);
      parser.parse('#    Multiple Spaces', builder);
      expect(builder.build().title).toBe('Multiple Spaces');

      // Multiple #s (should not parse)
      expect(parser.canParse('## Not a title')).toBe(false);
      expect(parser.canParse('### Not a title')).toBe(false);

      // Special characters
      parser.parse('# Title with @#$%^&*()', builder);
      expect(builder.build().title).toBe('Title with @#$%^&*()');

      // Unicode characters
      parser.parse('# 标题 タイトル', builder);
      expect(builder.build().title).toBe('标题 タイトル');

      // Leading/trailing whitespace
      parser.parse('#     Title with spaces     ', builder);
      expect(builder.build().title).toBe('Title with spaces');
    });

    it('should handle invalid titles', () => {
      // These should not be parsed as titles
      expect(parser.canParse('')).toBe(false);
      expect(parser.canParse(' ')).toBe(false);
      expect(parser.canParse('##')).toBe(false);
      expect(parser.canParse('# \n')).toBe(false);
      expect(parser.canParse('# \r')).toBe(false);
      expect(parser.canParse('# \t')).toBe(false);
      expect(parser.canParse('#    ')).toBe(false);
      expect(parser.canParse('#\t')).toBe(false);
    });

    it('should properly trim titles', () => {
      parser.parse('# Title with spaces ', builder);
      expect(builder.build().title).toBe('Title with spaces');

      builder = new MarkdownBuilder(); // Reset builder
      parser.parse('#    Lots of spaces    ', builder);
      expect(builder.build().title).toBe('Lots of spaces');

      builder = new MarkdownBuilder();
      parser.parse('# Title with tabs\t\t', builder);
      expect(builder.build().title).toBe('Title with tabs');
    });

    it('should handle titles with multiple spaces', () => {
      parser.parse('# Title  with  multiple  spaces', builder);
      expect(builder.build().title).toBe('Title  with  multiple  spaces');

      builder = new MarkdownBuilder();
      parser.parse('#     Title    with    spaces     ', builder);
      expect(builder.build().title).toBe('Title    with    spaces');
    });
  });

  describe('TagsParser', () => {
    const parser = new TagsParser();
    let builder: MarkdownBuilder;

    beforeEach(() => {
      builder = new MarkdownBuilder();
    });

    it('should handle basic tag cases', () => {
      expect(parser.canParse('tags: one, two')).toBe(true);
      expect(parser.canParse('Tags: one, two')).toBe(true);
      expect(parser.canParse('not tags')).toBe(false);
    });

    it('should handle edge cases', () => {
      // Empty tags
      parser.parse('tags:', builder);
      expect(builder.build().meta.tags).toEqual([]);

      // Tags with only spaces
      parser.parse('tags:    ', builder);
      expect(builder.build().meta.tags).toEqual([]);

      // Tags with extra spaces
      parser.parse('tags:  one  ,  two  ', builder);
      expect(builder.build().meta.tags).toEqual(['one', 'two']);

      // Empty tags between commas
      parser.parse('tags: one,,two', builder);
      expect(builder.build().meta.tags).toEqual(['one', 'two']);

      // Tags with special characters
      parser.parse('tags: @tag, #tag, tag!', builder);
      expect(builder.build().meta.tags).toEqual(['@tag', '#tag', 'tag!']);

      // Unicode tags
      parser.parse('tags: 标签, タグ', builder);
      expect(builder.build().meta.tags).toEqual(['标签', 'タグ']);

      // Duplicate tags
      parser.parse('tags: one, one, one', builder);
      expect(builder.build().meta.tags).toEqual(['one', 'one', 'one']);
    });
  });

  describe('ContentSectionParser', () => {
    let parser: ContentSectionParser;
    let builder: MarkdownBuilder;

    beforeEach(() => {
      parser = new ContentSectionParser();
      builder = new MarkdownBuilder();
    });

    it('should handle basic content cases', () => {
      // Should accept content section headers
      expect(parser.canParse('## content')).toBe(true);
      expect(parser.canParse('## Content')).toBe(true);

      // Should reject other section headers
      expect(parser.canParse('## other')).toBe(false);

      // Should accept content after entering content section
      expect(parser.canParse('## content')).toBe(true);
      expect(parser.canParse('regular content')).toBe(true);
    });

    it('should handle section transitions', () => {
      // Start outside content section
      expect(parser.canParse('regular text')).toBe(false);

      // Enter content section
      expect(parser.canParse('## content')).toBe(true);
      expect(parser.canParse('content text')).toBe(true);

      // Exit content section
      expect(parser.canParse('## other section')).toBe(false);
      expect(parser.canParse('more text')).toBe(false);

      // Re-enter content section
      expect(parser.canParse('## content')).toBe(true);
      expect(parser.canParse('more content')).toBe(true);
    });

    it('should handle edge cases in section headers', () => {
      // Extra spaces in section header
      expect(parser.canParse('##    content   ')).toBe(false);
      parser.parse('##    content   ', builder);

      // Mixed case
      expect(parser.canParse('## ConTenT')).toBe(true);

      // Unicode in section name (should not be content)
      expect(parser.canParse('## コンテンツ')).toBe(false);

      // More than two #s
      expect(parser.canParse('### content')).toBe(false);
      expect(parser.canParse('#### content')).toBe(false);
    });

    it('should handle content parsing', () => {
      // Enter content section
      parser.canParse('## content');
      parser.parse('## content', builder);

      // Parse various content types
      parser.parse('', builder); // Empty line
      parser.parse('   ', builder); // Whitespace line (should become empty)
      parser.parse('***', builder); // Markdown separator
      parser.parse('```', builder); // Code block start
      parser.parse('code here', builder);
      parser.parse('```', builder); // Code block end
      parser.parse('<div>html content</div>', builder); // HTML

      const result = builder.build();
      expect(result.content).toBe(
        '## content\n\n\n***\n```\ncode here\n```\n<div>html content</div>'
      );
    });

    it('should handle whitespace consistently', () => {
      parser.canParse('## content');
      parser.parse('## content', builder);

      // Test various whitespace scenarios
      parser.parse('', builder); // Empty line
      parser.parse('   ', builder); // Spaces only
      parser.parse('\t', builder); // Tab only
      parser.parse('\n', builder); // Newline only
      parser.parse('  \t  ', builder); // Mixed whitespace
      parser.parse('Next line', builder); // Normal content

      const result = builder.build();
      expect(result.content).toBe('## content\n\n\n\n\n\nNext line');
    });

    it('should preserve indentation in code blocks', () => {
      parser.canParse('## content');
      parser.parse('## content', builder);

      parser.parse('```', builder);
      parser.parse('    indented code', builder);
      parser.parse('  less indented', builder);
      parser.parse('```', builder);

      const result = builder.build();
      expect(result.content).toBe('## content\n```\n    indented code\n  less indented\n```');
    });

    it('should handle consecutive empty lines', () => {
      parser.canParse('## content');
      parser.parse('## content', builder);

      parser.parse('', builder);
      parser.parse('', builder);
      parser.parse('   ', builder);
      parser.parse('Text after empty lines', builder);

      const result = builder.build();
      expect(result.content).toBe('## content\n\n\n\nText after empty lines');
    });

    it('should handle nested headers', () => {
      parser.canParse('## content');
      parser.parse('## content', builder);

      // Nested headers should be included
      parser.parse('### level 3', builder);
      parser.parse('#### level 4', builder);
      parser.parse('##### level 5', builder);
      parser.parse('###### level 6', builder);

      const result = builder.build();
      expect(result.content).toBe(
        '## content\n### level 3\n#### level 4\n##### level 5\n###### level 6'
      );
    });

    it('should handle malformed markdown', () => {
      // Missing space after ##
      expect(parser.canParse('#content')).toBe(false);
      expect(parser.canParse('##content')).toBe(false);

      // Wrong number of spaces
      expect(parser.canParse('##  content')).toBe(false); // Extra space after ##
      expect(parser.canParse('##\tcontent')).toBe(false); // Tab after ##

      // Empty headers
      expect(parser.canParse('## ')).toBe(false); // Empty header
      expect(parser.canParse('##')).toBe(false); // Just hashes
      expect(parser.canParse('##  ')).toBe(false); // Multiple spaces after ##

      // Wrong number of #s
      expect(parser.canParse('# content')).toBe(false); // h1
      expect(parser.canParse('### content')).toBe(false); // h3
      expect(parser.canParse('#### content')).toBe(false); // h4

      // Malformed content word
      expect(parser.canParse('## con tent')).toBe(false);
      expect(parser.canParse('## contents')).toBe(false);
      expect(parser.canParse('## contentSection')).toBe(false);
    });

    it('should handle edge cases in header formatting', () => {
      // Valid formats
      expect(parser.canParse('## content')).toBe(true);
      expect(parser.canParse('## Content')).toBe(true);
      expect(parser.canParse('## CONTENT')).toBe(true);

      // Invalid formats
      expect(parser.canParse('## content ')).toBe(true); // Trailing space is ok
      expect(parser.canParse('##  content')).toBe(false);
      expect(parser.canParse('## content\t')).toBe(true); // Trailing tab is ok
    });

    it('should maintain section state correctly', () => {
      // Start outside content
      expect(parser.canParse('regular text')).toBe(false);

      // Enter malformed content section (should not enter)
      expect(parser.canParse('##content')).toBe(false);
      expect(parser.canParse('regular text')).toBe(false);

      // Enter proper content section
      expect(parser.canParse('## content')).toBe(true);
      expect(parser.canParse('regular text')).toBe(true);
    });

    it('should handle whitespace in section headers', () => {
      // Valid whitespace
      expect(parser.canParse('## content')).toBe(true);

      // Invalid whitespace
      expect(parser.canParse('##  content')).toBe(false);
      expect(parser.canParse('##\tcontent')).toBe(false);
      expect(parser.canParse('## \tcontent')).toBe(false);
      expect(parser.canParse('##\t content')).toBe(false);

      // Trailing whitespace (should be allowed)
      expect(parser.canParse('## content ')).toBe(true);
      expect(parser.canParse('## content  ')).toBe(true);
      expect(parser.canParse('## content\t')).toBe(true);
    });

    it('should preserve content formatting', () => {
      parser.canParse('## content');
      parser.parse('## content', builder);

      // Test various markdown formatting
      parser.parse('**bold text**', builder);
      parser.parse('_italic text_', builder);
      parser.parse('- list item', builder);
      parser.parse('1. numbered item', builder);
      parser.parse('> blockquote', builder);

      const result = builder.build();
      expect(result.content).toBe(
        '## content\n**bold text**\n_italic text_\n- list item\n1. numbered item\n> blockquote'
      );
    });
  });
});
