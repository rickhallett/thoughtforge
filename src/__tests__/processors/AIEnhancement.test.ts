// src/tests/processors/ai-enhancement.test.ts
import { AIEnhancementProcessor } from '../../processors/AIEnhancement';
import { ContentSource, ProcessedContent } from '../../types/content';

jest.mock('../../lib/logger/Logger');

describe('AIEnhancementProcessor', () => {
  let processor: AIEnhancementProcessor;
  let sampleContent: ProcessedContent;

  beforeEach(() => {
    processor = new AIEnhancementProcessor();
    sampleContent = {
      id: 'test-123',
      title: 'Test Content',
      body: 'This is a sample article about artificial intelligence and machine learning. ' +
        'The technology has made significant advances in recent years.',
      source: ContentSource.MANUAL,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'processing',
      metadata: {}
    };
  });

  describe('Basic Enhancement', () => {
    it('should process content with default options', async () => {
      const result = await processor.process(sampleContent);

      expect(result.metadata.aiEnhanced).toBe(true);
      expect(result.metadata.aiEnhancementTimestamp).toBeDefined();
      expect(result.metadata.summary).toBeDefined();
      expect(result.metadata.keywords).toBeDefined();
      expect(result.metadata.readabilityScore).toBeDefined();
    });

    it('should preserve original content when not expanding', async () => {
      const result = await processor.process(sampleContent, {
        generateSummary: true,
        expandContent: false
      });

      expect(result.body).toBe(sampleContent.body);
    });
  });

  describe('Specific Enhancements', () => {
    it('should generate summary when requested', async () => {
      const result = await processor.process(sampleContent, {
        generateSummary: true
      });

      expect(result.metadata.summary).toBeDefined();
      expect(typeof result.metadata.summary).toBe('string');
    });

    it('should extract keywords when requested', async () => {
      const result = await processor.process(sampleContent, {
        extractKeywords: true
      });

      expect(result.metadata.keywords).toBeDefined();
      expect(Array.isArray(result.metadata.keywords)).toBe(true);
      expect(result.metadata.keywords.length).toBeGreaterThan(0);
    });

    it('should expand content when requested', async () => {
      const result = await processor.process(sampleContent, {
        expandContent: true
      });

      expect(result.body.length).toBeGreaterThan(sampleContent.body.length);
    });

    it('should analyze readability when requested', async () => {
      const result = await processor.process(sampleContent, {
        improveReadability: true
      });

      expect(result.metadata.readabilityScore).toBeDefined();
      expect(result.metadata.suggestedImprovements).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle empty content', async () => {
      const emptyContent = {
        ...sampleContent,
        body: ''
      };

      const result = await processor.process(emptyContent);
      expect(result.metadata.aiEnhanced).toBe(true);
    });

    it('should handle very short content', async () => {
      const shortContent = {
        ...sampleContent,
        body: 'Short.'
      };

      const result = await processor.process(shortContent);
      expect(result.metadata.aiEnhanced).toBe(true);
    });
  });
});