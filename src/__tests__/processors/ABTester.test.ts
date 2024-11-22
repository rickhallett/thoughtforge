// src/tests/processors/ab-processor.test.ts
import { ABTestProcessor } from '../../processors/ABTester';
import { ContentSource, ProcessedContent } from '../../types/content';

jest.mock('../../lib/logger/Logger');

describe('ABTestProcessor', () => {
  let processor: ABTestProcessor;
  let sampleContent: ProcessedContent;

  beforeEach(() => {
    processor = new ABTestProcessor();
    sampleContent = {
      id: 'test-123',
      title: 'Understanding A/B Testing',
      body: `
                A/B testing is a powerful way to optimize content.
                
                This article will explore various testing methods.

                ## Key Concepts
                
                Here are the main points to understand.

                ## Conclusion
                
                Start optimizing your content today!
            `,
      source: ContentSource.MANUAL,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'processing',
      metadata: {}
    };
  });

  describe('Basic Variant Generation', () => {
    it('should generate variants with default options', async () => {
      const result = await processor.process(sampleContent);

      expect(result.metadata.abTesting.variantsGenerated).toBe(true);
      expect(result.metadata.abTesting.generationTimestamp).toBeDefined();
      expect(result.metadata.abTesting.variants.length).toBeGreaterThan(0);
    });

    it('should preserve original content', async () => {
      const result = await processor.process(sampleContent);
      expect(result.body).toBe(sampleContent.body);
      expect(result.title).toBe(sampleContent.title);
    });
  });

  describe('Title Variants', () => {
    it('should generate specified number of title variants', async () => {
      const result = await processor.process(sampleContent, {
        generateTitleVariants: true,
        variantsPerType: 3
      });

      const titleVariants = result.metadata.abTesting.variants
        .filter(v => v.type === 'title');

      expect(titleVariants.length).toBe(3);
      expect(titleVariants[0].originalContent).toBe(sampleContent.title);
    });

    it('should generate unique title variants', async () => {
      const result = await processor.process(sampleContent, {
        generateTitleVariants: true,
        variantsPerType: 2
      });

      const titleVariants = result.metadata.abTesting.variants
        .filter(v => v.type === 'title');

      const uniqueVariants = new Set(titleVariants.map(v => v.variantContent));
      expect(uniqueVariants.size).toBe(titleVariants.length);
    });
  });

  describe('CTA Variants', () => {
    it('should generate CTA variants', async () => {
      const result = await processor.process(sampleContent, {
        generateCtaVariants: true,
        variantsPerType: 2
      });

      const ctaVariants = result.metadata.abTesting.variants
        .filter(v => v.type === 'cta');

      expect(ctaVariants.length).toBe(2);
      expect(ctaVariants[0].hypothesis).toBeDefined();
      expect(ctaVariants[0].metrics).toContain('conversion_rate');
    });
  });

  describe('Test Recommendations', () => {
    it('should generate test recommendations', async () => {
      const result = await processor.process(sampleContent);

      expect(result.metadata.abTesting.recommendedTests).toBeDefined();
      expect(result.metadata.abTesting.recommendedTests.length).toBeGreaterThan(0);
    });

    it('should include expected impact estimates', async () => {
      const result = await processor.process(sampleContent);

      expect(result.metadata.abTesting.expectedImpact).toBeDefined();
      expect(result.metadata.abTesting.expectedImpact.length).toBeGreaterThan(0);
      expect(result.metadata.abTesting.expectedImpact[0].metric).toBeDefined();
      expect(result.metadata.abTesting.expectedImpact[0].estimatedLift).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle content without paragraphs', async () => {
      const contentWithoutParagraphs = {
        ...sampleContent,
        content: 'Single line content'
      };

      const result = await processor.process(contentWithoutParagraphs);
      expect(result.metadata.abTesting.variantsGenerated).toBe(true);
    });

    it('should handle empty content sections', async () => {
      const emptyContent = {
        ...sampleContent,
        content: '',
        title: ''
      };

      const result = await processor.process(emptyContent);
      expect(result.metadata.abTesting.variantsGenerated).toBe(true);
    });
  });
});