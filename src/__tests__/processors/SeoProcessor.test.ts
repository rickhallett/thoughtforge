// src/tests/processors/seo-processor.test.ts
import { SEOProcessor } from '../../processors/SeoProcessor';
import { ProcessedContent, ContentSource } from '../../types/content';

jest.mock('../../lib/logger/Logger');

describe('SEOProcessor', () => {
  let processor: SEOProcessor;
  let sampleContent: ProcessedContent;

  beforeEach(() => {
    processor = new SEOProcessor();
    sampleContent = {
      id: 'test-123',
      title: 'Test Article About SEO Best Practices',
      body: `# Main Heading About SEO
                
                This is a test article about SEO best practices. We're going to
                discuss various SEO techniques and strategies.

                ## Key SEO Strategies
                
                1. Keyword Research
                2. Content Optimization
                3. Technical SEO

                ## Implementation
                
                Let's dive into the implementation details...`,
      source: ContentSource.MANUAL,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'processing',
      metadata: {
        keywords: ['SEO', 'best practices', 'optimization'],
        metaDescription: 'Learn about SEO best practices and implementation strategies in this comprehensive guide.'
      }
    };
  });

  describe('Basic SEO Analysis', () => {
    it('should analyze content with default options', async () => {
      const result = await processor.process(sampleContent);

      expect(result.metadata.seoAnalyzed).toBe(true);
      expect(result.metadata.seoAnalysisTimestamp).toBeDefined();
      expect(result.metadata.seoScore).toBeDefined();
      expect(result.metadata.seoAnalysis).toBeDefined();
    });

    it('should preserve original content', async () => {
      const result = await processor.process(sampleContent);
      expect(result.body).toBe(sampleContent.body);
    });
  });

  describe('Title Analysis', () => {
    it('should analyze title length', async () => {
      const result = await processor.process(sampleContent, {
        analyzeTitleTag: true
      });

      expect(result.metadata.seoAnalysis.titleAnalysis).toBeDefined();
      expect(result.metadata.seoAnalysis.titleAnalysis.length).toBeDefined();
    });

    it('should detect keyword in title', async () => {
      const result = await processor.process(sampleContent, {
        analyzeTitleTag: true
      });

      expect(result.metadata.seoAnalysis.titleAnalysis.containsKeyword).toBe(true);
    });
  });

  describe('Keyword Analysis', () => {
    it('should calculate keyword density', async () => {
      const result = await processor.process(sampleContent, {
        analyzeKeywordDensity: true
      });

      expect(result.metadata.seoAnalysis.keywordAnalysis).toBeDefined();
      expect(result.metadata.seoAnalysis.keywordAnalysis.density).toBeDefined();
      expect(result.metadata.seoAnalysis.keywordAnalysis.count).toBeGreaterThan(0);
    });
  });

  describe('Heading Analysis', () => {
    it('should analyze heading structure', async () => {
      const result = await processor.process(sampleContent, {
        analyzeHeadings: true
      });

      expect(result.metadata.seoAnalysis.headingsAnalysis).toBeDefined();
      expect(result.metadata.seoAnalysis.headingsAnalysis.h1Count).toBe(1);
      expect(result.metadata.seoAnalysis.headingsAnalysis.headingStructure).toBeDefined();
    });
  });

  describe('Readability', () => {
    it('should calculate readability score', async () => {
      const result = await processor.process(sampleContent, {
        checkReadability: true
      });

      expect(result.metadata.seoAnalysis.readabilityScore).toBeDefined();
      expect(result.metadata.seoAnalysis.readabilityScore).toBeGreaterThanOrEqual(0);
      expect(result.metadata.seoAnalysis.readabilityScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle content without keywords', async () => {
      const contentWithoutKeywords = {
        ...sampleContent,
        metadata: {}
      };

      const result = await processor.process(contentWithoutKeywords);
      expect(result.metadata.seoAnalyzed).toBe(true);
    });

    it('should handle empty content', async () => {
      const emptyContent = {
        ...sampleContent,
        content: ''
      };

      const result = await processor.process(emptyContent);
      expect(result.metadata.seoAnalyzed).toBe(true);
    });
  });
});