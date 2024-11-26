import {
  normalizeLineEndings,
  removeExtraWhitespace,
  convertTabsToSpaces,
  validateRequiredFields,
  addTimeToRead
} from '../../../src/utils/markdownParser';

describe('Pre-process Hooks', () => {
  describe('normalizeLineEndings', () => {
    it('should convert CRLF to LF', () => {
      const input = 'line1\r\nline2\r\nline3';
      expect(normalizeLineEndings(input)).toBe('line1\nline2\nline3');
    });
  });

  describe('removeExtraWhitespace', () => {
    it('should collapse multiple empty lines', () => {
      const input = 'line1\n\n\n\nline2';
      expect(removeExtraWhitespace(input)).toBe('line1\n\nline2');
    });
  });

  describe('convertTabsToSpaces', () => {
    it('should convert tabs to spaces', () => {
      const input = 'line1\tindented';
      expect(convertTabsToSpaces(input)).toBe('line1    indented');
    });
  });
});

describe('Post-process Hooks', () => {
  describe('validateRequiredFields', () => {
    it('should throw error for missing title', () => {
      const doc = {
        title: '',
        content: 'content',
        meta: {}
      };
      expect(() => validateRequiredFields(doc)).toThrow('Document must have a title');
    });

    it('should throw error for missing content', () => {
      const doc = {
        title: 'title',
        content: '',
        meta: {}
      };
      expect(() => validateRequiredFields(doc)).toThrow('Document must have content');
    });
  });

  describe('addTimeToRead', () => {
    it('should calculate reading time correctly', () => {
      const words = Array(400).fill('word').join(' '); // 400 words
      const doc = {
        title: 'title',
        content: words,
        meta: {}
      };
      
      const result = addTimeToRead(doc);
      expect(result.meta.timeToRead).toBe(2); // 2 minutes for 400 words
    });
  });
}); 