import { ContentProcessor, ProcessingMetadata, ProcessingResult } from './interfaces/contentProcessor';
import { StandardizationProcessor } from './processors/standardizationProcessor';
import { AIEnhancementProcessor } from './processors/aiEnhancementProcessor';
import { SEOEnhancementProcessor } from './processors/seoEnhancementProcessor';

export class ContentPipeline {
  private processors: ContentProcessor[];

  constructor() {
    this.processors = [
      new StandardizationProcessor(),
      new AIEnhancementProcessor(),
      new SEOEnhancementProcessor()
    ];
  }

  async process(content: string, metadata: ProcessingMetadata): Promise<ProcessingResult> {
    let currentContent = content;
    let currentMetadata = metadata;
    const allProcessingNotes: string[] = [];

    for (const processor of this.processors) {
      try {
        const result = await processor.process(currentContent, currentMetadata);
        currentContent = result.content;
        currentMetadata = result.metadata;
        
        if (result.processingNotes) {
          allProcessingNotes.push(...result.processingNotes);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        allProcessingNotes.push(`Error in processing step: ${errorMessage}`);
        throw error;
      }
    }

    return {
      content: currentContent,
      metadata: currentMetadata,
      processingNotes: allProcessingNotes
    };
  }
}
