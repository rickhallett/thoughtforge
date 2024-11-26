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
  private document: MarkdownDocument = {
    title: '',
    content: '',
    meta: {
      tags: [],
      lastUpdated: new Date().toISOString()
    }
  };

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

// Main Parser
export class MarkdownParser {
  private strategies: LineParserStrategy[];

  constructor() {
    this.strategies = [
      new TitleParser(),
      new TagsParser(),
      new ContentSectionParser()
    ];
  }

  parseMarkdown(markdown: string): MarkdownDocument {
    const builder = new MarkdownBuilder();
    const lines = markdown.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      for (const strategy of this.strategies) {
        if (strategy.canParse(trimmedLine)) {
          strategy.parse(trimmedLine, builder);
          break;
        }
      }
    }

    return builder.build();
  }
}