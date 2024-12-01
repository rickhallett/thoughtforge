import { ContentPipeline } from '../pipelines/contentPipeline';
import { ProcessingMetadata, ProcessingResult } from '../pipelines/interfaces/contentProcessor';

export class PipelineService {
  private pipeline: ContentPipeline;

  constructor() {
    this.pipeline = new ContentPipeline();
  }

  async executePipeline(content: string, metadata: ProcessingMetadata): Promise<ProcessingResult> {
    try {
      const result = await this.pipeline.process(content, metadata);

      // Log processing completion
      console.log('Pipeline processing completed:', {
        processingNotes: result.processingNotes,
        contentType: result.metadata.contentType,
        targetFormat: result.metadata.targetFormat,
      });

      return result;
    } catch (error) {
      // Log processing error
      console.error('Pipeline processing failed:', error);
      throw error;
    }
  }

  // Helper method to validate input metadata
  private validateMetadata(metadata: ProcessingMetadata): void {
    if (!metadata.contentType) {
      throw new Error('Content type is required in metadata');
    }
    if (!metadata.targetFormat) {
      throw new Error('Target format is required in metadata');
    }
  }
}
