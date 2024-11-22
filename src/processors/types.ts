export interface ContentProcessor {
  process(content: any): Promise<any>;
} 