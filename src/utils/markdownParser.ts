interface MarkdownMeta {
  tags?: string[];
  lastUpdated?: string; // ISO format
}

interface MarkdownDocument {
  title: string;
  content: string;
  meta: MarkdownMeta;
}

// Parser Strategies
interface LineParserStrategy {
  canParse(line: string): boolean;
  parse(line: string, builder: MarkdownBuilder): void;
}

class TitleParser implements LineParserStrategy {
  canParse(line: string): boolean {
    return line.startsWith('# ');
  }

  parse(line: string, builder: MarkdownBuilder): void {
    builder.setTitle(line.replace('# ', ''));
  }
}

class TagsParser implements LineParserStrategy {
  canParse(line: string): boolean {
    return line.toLowerCase().startsWith('tags:');
  }

  parse(line: string, builder: MarkdownBuilder): void {
    const tagsString = line.substring(5).trim();
    const tags = tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    builder.setTags(tags);
  }
}

class ContentSectionParser implements LineParserStrategy {
  private isInContentSection = false;

  canParse(line: string): boolean {
    if (line.startsWith('## ')) {
      this.isInContentSection = line.replace('## ', '').toLowerCase() === 'content';
      return true;
    }
    return this.isInContentSection;
  }

  parse(line: string, builder: MarkdownBuilder): void {
    if (!line.startsWith('## ')) {
      builder.appendContent(line);
    }
  }
}

// Builder
class MarkdownBuilder {
  private document: MarkdownDocument;

  constructor(defaultMeta: Partial<MarkdownMeta> = {}) {
    this.document = {
      title: '',
      content: '',
      meta: {
        tags: [],
        lastUpdated: new Date().toISOString(),
        ...defaultMeta
      }
    };
  }

  private contentLines: string[] = [];

  setTitle(title: string): void {
    this.document.title = title;
  }

  setTags(tags: string[]): void {
    this.document.meta.tags = tags;
  }

  appendContent(line: string): void {
    this.contentLines.push(line);
  }

  build(): MarkdownDocument {
    this.document.content = this.contentLines.join('\n').trim();
    return { ...this.document };
  }
}

// Hook types
type PreProcessHook = (markdown: string) => string;
type PostProcessHook = (document: MarkdownDocument) => MarkdownDocument;

// Updated config interface
interface ParserConfig {
  strategies?: LineParserStrategy[];
  defaultMeta?: Partial<MarkdownMeta>;
  preProcessHooks?: PreProcessHook[];
  postProcessHooks?: PostProcessHook[];
}

// Main Parser
export class MarkdownParser {
  private strategies: LineParserStrategy[];
  private preProcessHooks: PreProcessHook[];
  private postProcessHooks: PostProcessHook[];
  private config: ParserConfig;

  constructor(config: ParserConfig = {}) {
    this.config = config;
    this.strategies = config.strategies || [
      new TitleParser(),
      new TagsParser(),
      new ContentSectionParser()
    ];
    this.preProcessHooks = config.preProcessHooks || [];
    this.postProcessHooks = config.postProcessHooks || [];
  }

  parseMarkdown(markdown: string): MarkdownDocument {
    // Apply pre-process hooks
    let processedMarkdown = this.preProcessHooks.reduce(
      (text, hook) => hook(text),
      markdown
    );

    // Parse the markdown
    const builder = new MarkdownBuilder(this.config.defaultMeta);
    const lines = processedMarkdown.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      for (const strategy of this.strategies) {
        if (strategy.canParse(trimmedLine)) {
          strategy.parse(trimmedLine, builder);
          break;
        }
      }
    }

    // Apply post-process hooks
    let document = builder.build();
    document = this.postProcessHooks.reduce(
      (doc, hook) => hook(doc),
      document
    );

    return document;
  }
}