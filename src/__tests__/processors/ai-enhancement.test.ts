// src/tests/processors/ai-enhancement.test.ts
import { AIEnhancementProcessor } from '../../processors/ai-enhancement';
import { ContentSource, ContentStatus, ProcessedContent } from '../../types/content';

// Mock OpenAI
jest.mock('@langchain/openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    invoke: jest.fn().mockResolvedValue('mocked response'),
  }))
}));

// Mock fs/promises
jest.mock('fs/promises', () => ({
  readdir: jest.fn().mockResolvedValue(['summary.txt', 'keywords.txt', 'expansion.txt', 'readability.txt']),
  readFile: jest.fn().mockResolvedValue('Mock prompt template text'),
}));

describe('AIEnhancementProcessor', () => {
  let processor: AIEnhancementProcessor;
  let mockContent: ProcessedContent;

  beforeEach(() => {
    jest.clearAllMocks();
    processor = new AIEnhancementProcessor('fake-api-key');
    mockContent = {
      id: 'test-123',
      title: 'Test Content',
      body: 'This is test content.',
      metadata: {},
      source: 'test' as ContentSource,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'ready' as ContentStatus,
    };
  });

  describe('Constructor', () => {
    test('should initialize with provided API key', () => {
      const processor = new AIEnhancementProcessor('custom-key');
      expect(processor).toBeInstanceOf(AIEnhancementProcessor);
    });

    test('should initialize with environment API key', () => {
      process.env.OPENAI_API_KEY = 'env-key';
      const processor = new AIEnhancementProcessor();
      expect(processor).toBeInstanceOf(AIEnhancementProcessor);
    });
  });

  describe('Process Method', () => {
    test('should process content with default options', async () => {
      const result = await processor.process(mockContent);
      expect(result).toBeDefined();
      expect(result.metadata).toHaveProperty('summary');
      expect(result.metadata).toHaveProperty('keywords');
      expect(result.metadata).toHaveProperty('readability');
    });

    test('should process content with custom options', async () => {
      const result = await processor.process(mockContent, {
        generateSummary: true,
        extractKeywords: false,
        expandContent: false,
        improveReadability: false,
      });
      expect(result.metadata).toHaveProperty('summary');
      expect(result.metadata).not.toHaveProperty('keywords');
      expect(result.metadata).not.toHaveProperty('readability');
    });

    test('should handle content expansion', async () => {
      const result = await processor.process(mockContent, {
        generateSummary: false,
        extractKeywords: false,
        expandContent: true,
        improveReadability: false,
      });
      expect(result.metadata).toHaveProperty('originalContent');
      expect(result.body).not.toBe(mockContent.body);
    });
  });

  describe('Error Handling', () => {
    test('should handle OpenAI API errors', async () => {
      // Mock OpenAI to throw an error
      jest.mock('@langchain/openai', () => ({
        OpenAI: jest.fn().mockImplementation(() => ({
          invoke: jest.fn().mockRejectedValue(new Error('API Error')),
        }))
      }));

      await expect(processor.process(mockContent)).rejects.toThrow();
    });

    test('should handle prompt loading errors', async () => {
      // Mock fs to throw an error
      jest.mock('fs/promises', () => ({
        readdir: jest.fn().mockRejectedValue(new Error('File system error')),
      }));

      await expect(processor.process(mockContent)).rejects.toThrow();
    });
  });

  describe('Parser Handling', () => {
    test('should handle malformed keyword responses', async () => {
      // Mock OpenAI to return malformed data
      const mockOpenAI = jest.fn().mockResolvedValue('invalid json');
      jest.mock('@langchain/openai', () => ({
        OpenAI: jest.fn().mockImplementation(() => ({
          invoke: mockOpenAI,
        }))
      }));

      const result = await processor.process(mockContent, {
        generateSummary: false,
        extractKeywords: true,
        expandContent: false,
        improveReadability: false,
      });

      expect(result.metadata.keywords).toBeDefined();
    });

    test('should handle malformed readability responses', async () => {
      // Mock OpenAI to return malformed data
      const mockOpenAI = jest.fn().mockResolvedValue('invalid json');
      jest.mock('@langchain/openai', () => ({
        OpenAI: jest.fn().mockImplementation(() => ({
          invoke: mockOpenAI,
        }))
      }));

      const result = await processor.process(mockContent, {
        generateSummary: false,
        extractKeywords: false,
        expandContent: false,
        improveReadability: true,
      });

      expect(result.metadata.readability).toBeDefined();
    });
  });

  describe('Content Chunking', () => {
    test('should handle large content appropriately', async () => {
      const largeContent = {
        ...mockContent,
        body: 'a'.repeat(5000), // Create a large piece of content
      };

      const result = await processor.process(largeContent);
      expect(result).toBeDefined();
      expect(result.metadata).toHaveProperty('summary');
    });
  });
});