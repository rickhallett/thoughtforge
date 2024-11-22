import { ContentProcessor } from "./types";
import { ContentStandardizer } from "./ContentStandardizer";

export class ProcessorManager {
  private processors: Map<string, ContentProcessor>;

  constructor() {
    this.processors = new Map();
    this.registerDefaultProcessors();
  }

  private registerDefaultProcessors() {
    this.registerProcessor('standardization', new ContentStandardizer());
    // this.registerProcessor('ai-enhancement', new AIProcessor());
    // this.registerProcessor('seo-optimization', new SEOProcessor());
    // this.registerProcessor('ab-generation', new ABProcessor());
  }

  registerProcessor(step: string, processor: ContentProcessor) {
    this.processors.set(step, processor);
  }

  async process(step: string, content: any): Promise<any> {
    const processor = this.processors.get(step);
    if (!processor) {
      throw new Error(`No processor found for step: ${step}`);
    }
    return processor.process(content);
  }
} 