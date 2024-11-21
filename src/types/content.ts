export enum ContentSource {
  MANUAL = 'manual',
  MARKDOWN = 'markdown'
}

export interface RawContent {
    title?: string;
    body: string;
    source: ContentSource;
  }
  
  export interface ProcessedContent {
    id: string;
    title: string;
    body: string;
    source: ContentSource;
    createdAt: Date;
    status: 'received' | 'processed';
  }

export function isValidSource(source: string): source is ContentSource {
  return Object.values(ContentSource).includes(source as ContentSource);
}