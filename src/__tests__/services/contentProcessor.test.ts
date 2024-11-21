import { ContentProcessor } from '../../services/contentProcessor';
import { RawContent, ContentSource } from '../../types/content';

describe('ContentProcessor', () => {
  let processor: ContentProcessor;

  beforeEach(() => {
    processor = new ContentProcessor();
  });

  describe('processContent', () => {
    it('should generate a valid processed content object', () => {
      const raw: RawContent = {
        body: 'Test content',
        source: ContentSource.MANUAL
      };

      const processed = processor.processContent(raw);

      expect(processed).toMatchObject({
        body: 'Test content',
        source: 'manual',
        status: 'processed'
      });
      expect(processed.id).toBeDefined();
      expect(processed.createdAt).toBeInstanceOf(Date);
    });

    it('should use "Untitled" when title is not provided', () => {
      const raw: RawContent = {
        body: 'Test content',
        source: ContentSource.MANUAL
      };

      const processed = processor.processContent(raw);
      expect(processed.title).toBe('Untitled');
    });

    it('should use provided title when available', () => {
      const raw: RawContent = {
        title: 'My Title',
        body: 'Test content',
        source: ContentSource.MANUAL
      };

      const processed = processor.processContent(raw);
      expect(processed.title).toBe('My Title');
    });
  });

  describe('standardizeBody', () => {
    // We need to make standardizeBody public or create a new public method for testing
    it('should standardize Windows line endings', () => {
      const raw: RawContent = {
        body: 'Line 1\r\nLine 2\r\nLine 3',
        source: ContentSource.MANUAL
      };

      const processed = processor.processContent(raw);
      expect(processed.body).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should remove excessive line breaks', () => {
      const raw: RawContent = {
        body: 'Line 1\n\n\n\nLine 2',
        source: ContentSource.MANUAL
      };

      const processed = processor.processContent(raw);
      expect(processed.body).toBe('Line 1\n\nLine 2');
    });

    it('should trim whitespace', () => {
      const raw: RawContent = {
        body: '  \n  Content with spaces  \n  ',
        source: ContentSource.MANUAL
      };

      const processed = processor.processContent(raw);
      expect(processed.body).toBe('Content with spaces');
    });
  });
});