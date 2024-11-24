export interface PromptParams {
  content: string;
  contentType: string;
  voice?: string;
  tone?: string;
  complexity?: string;
  audience?: string;
  articleType?: string;
  context?: string;
  keywords?: string[];
  searchIntent?: string;
  targetLength?: string;
  channels?: string[];
  goals?: string[];
  [key: string]: any;
}