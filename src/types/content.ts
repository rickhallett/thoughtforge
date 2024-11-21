export interface RawContent {
    title?: string;
    body: string;
    source: 'manual' | 'email';
  }
  
  export interface ProcessedContent {
    id: string;
    title: string;
    body: string;
    source: 'manual' | 'email';
    createdAt: Date;
    status: 'received' | 'processed';
  }