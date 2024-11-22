// src/processors/seo-processor.ts
import { logger } from '../lib/logger/logger';
import { ProcessedContent } from '../types/content';

export interface SEOOptions {
  analyzeTitleTag?: boolean;
  analyzeMetaDescription?: boolean;
  analyzeHeadings?: boolean;
  analyzeKeywordDensity?: boolean;
  suggestInternalLinks?: boolean;
  checkReadability?: boolean;
}

export interface SEOAnalysis {
  score: number;
  titleAnalysis?: {
    length: number;
    containsKeyword: boolean;
    suggestions: string[];
  };
  metaDescription?: {
    length: number;
    containsKeyword: boolean;
    suggestions: string[];
  };
  headingsAnalysis?: {
    h1Count: number;
    headingStructure: string[];
    suggestions: string[];
  };
  keywordAnalysis?: {
    density: number;
    count: number;
    suggestions: string[];
  };
  internalLinkSuggestions?: string[];
  readabilityScore?: number;
}

export class SEOProcessor {
  async process(
    content: ProcessedContent,
    options: SEOOptions = {
      analyzeTitleTag: true,
      analyzeMetaDescription: true,
      analyzeHeadings: true,
      analyzeKeywordDensity: true,
      suggestInternalLinks: true,
      checkReadability: true
    }
  ): Promise<ProcessedContent> {
    logger.debug('Starting SEO analysis', {
      contentId: content.id,
      options
    });

    try {
      const seoAnalysis = await this.analyzeSEO(content, options);

      // Update content with SEO analysis
      const optimizedContent: ProcessedContent = {
        ...content,
        metadata: {
          ...content.metadata,
          seoAnalyzed: true,
          seoAnalysisTimestamp: new Date().toISOString(),
          seoScore: seoAnalysis.score,
          seoAnalysis: seoAnalysis,
        }
      };

      logger.info('SEO analysis completed', {
        contentId: content.id,
        score: seoAnalysis.score
      });

      return optimizedContent;

    } catch (error) {
      logger.error('SEO analysis failed', {
        contentId: content.id,
        error
      });
      throw error;
    }
  }

  private async analyzeSEO(
    content: ProcessedContent,
    options: SEOOptions
  ): Promise<SEOAnalysis> {
    const analysis: SEOAnalysis = {
      score: 0,
      titleAnalysis: {
        length: 0,
        containsKeyword: false,
        suggestions: []
      }
    };

    const tasks: Promise<void>[] = [];

    if (options.analyzeTitleTag) {
      tasks.push(this.analyzeTitle(content, analysis));
    }

    if (options.analyzeMetaDescription) {
      tasks.push(this.analyzeMetaDescription(content, analysis));
    }

    if (options.analyzeHeadings) {
      tasks.push(this.analyzeHeadings(content, analysis));
    }

    if (options.analyzeKeywordDensity) {
      tasks.push(this.analyzeKeywordDensity(content, analysis));
    }

    if (options.suggestInternalLinks) {
      tasks.push(this.suggestInternalLinks(content, analysis));
    }

    if (options.checkReadability) {
      tasks.push(this.checkReadability(content, analysis));
    }

    await Promise.all(tasks);

    // Calculate overall score based on individual analyses
    analysis.score = this.calculateOverallScore(analysis);

    return analysis;
  }

  private async analyzeTitle(
    content: ProcessedContent,
    analysis: SEOAnalysis
  ): Promise<void> {
    const title = content.title;
    const keywords = content.metadata.keywords || [];

    analysis.titleAnalysis = {
      length: title.length,
      containsKeyword: keywords.some(keyword =>
        title.toLowerCase().includes(keyword.toLowerCase())
      ),
      suggestions: []
    };

    if (title.length < 30 || title.length > 60) {
      analysis.titleAnalysis.suggestions.push(
        'Title length should be between 30-60 characters'
      );
    }

    if (!analysis.titleAnalysis.containsKeyword) {
      analysis.titleAnalysis.suggestions.push(
        'Consider including a primary keyword in the title'
      );
    }
  }

  private async analyzeMetaDescription(
    content: ProcessedContent,
    analysis: SEOAnalysis
  ): Promise<void> {
    const description = content.metadata.metaDescription || '';
    const keywords = content.metadata.keywords || [];

    analysis.metaDescription = {
      length: description.length,
      containsKeyword: keywords.some(keyword =>
        description.toLowerCase().includes(keyword.toLowerCase())
      ),
      suggestions: []
    };

    if (description.length < 120 || description.length > 155) {
      analysis.metaDescription.suggestions.push(
        'Meta description should be between 120-155 characters'
      );
    }
  }

  private async analyzeHeadings(
    content: ProcessedContent,
    analysis: SEOAnalysis
  ): Promise<void> {
    // Simple heading analysis based on markdown-style headings
    const headings = content.body.match(/#{1,6}\s.+/g) || [];

    analysis.headingsAnalysis = {
      h1Count: headings.filter(h => h.startsWith('# ')).length,
      headingStructure: headings.map(h => h.match(/#{1,6}/)[0].length.toString()),
      suggestions: []
    };

    if (analysis.headingsAnalysis.h1Count !== 1) {
      analysis.headingsAnalysis.suggestions.push(
        'Content should have exactly one H1 heading'
      );
    }
  }

  private async analyzeKeywordDensity(
    content: ProcessedContent,
    analysis: SEOAnalysis
  ): Promise<void> {
    const keywords = content.metadata.keywords || [];
    const wordCount = content.body.split(/\s+/).length;

    analysis.keywordAnalysis = {
      density: 0,
      count: 0,
      suggestions: []
    };

    if (keywords.length > 0) {
      const keywordCount = keywords.reduce((count, keyword) => {
        const regex = new RegExp(keyword, 'gi');
        const matches = content.body.match(regex) || [];
        return count + matches.length;
      }, 0);

      analysis.keywordAnalysis.count = keywordCount;
      analysis.keywordAnalysis.density = (keywordCount / wordCount) * 100;

      if (analysis.keywordAnalysis.density < 1) {
        analysis.keywordAnalysis.suggestions.push(
          'Consider increasing keyword density (currently below 1%)'
        );
      } else if (analysis.keywordAnalysis.density > 3) {
        analysis.keywordAnalysis.suggestions.push(
          'Consider reducing keyword density (currently above 3%)'
        );
      }
    }
  }

  private async suggestInternalLinks(
    content: ProcessedContent,
    analysis: SEOAnalysis
  ): Promise<void> {
    // This would typically integrate with your content database
    // to find related content for internal linking
    analysis.internalLinkSuggestions = [
      'Consider linking to related content',
      'Add links to category pages',
      'Link to cornerstone content'
    ];
  }

  private async checkReadability(
    content: ProcessedContent,
    analysis: SEOAnalysis
  ): Promise<void> {
    // Simple readability score based on sentence length
    const sentences = content.body.split(/[.!?]+/);
    const avgWordsPerSentence = sentences.reduce((sum, sentence) => {
      return sum + sentence.trim().split(/\s+/).length;
    }, 0) / sentences.length;

    analysis.readabilityScore = Math.max(0, Math.min(100,
      100 - (avgWordsPerSentence - 15) * 5
    ));
  }

  private calculateOverallScore(analysis: SEOAnalysis): number {
    let score = 100;
    let factors = 0;

    if (analysis.titleAnalysis) {
      score += analysis.titleAnalysis.suggestions.length ? 0 : 20;
      factors++;
    }

    if (analysis.metaDescription) {
      score += analysis.metaDescription.suggestions.length ? 0 : 20;
      factors++;
    }

    if (analysis.keywordAnalysis) {
      const keywordScore = analysis.keywordAnalysis.density >= 1
        && analysis.keywordAnalysis.density <= 3 ? 20 : 0;
      score += keywordScore;
      factors++;
    }

    if (analysis.readabilityScore) {
      score += analysis.readabilityScore;
      factors++;
    }

    return Math.round(score / (factors + 1));
  }
}