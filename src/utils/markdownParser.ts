// Interfaces
export interface MarkdownMeta {
  tags?: string[];
  lastUpdated?: string; // ISO format
  author?: string;
  timeToRead?: number;
}

export interface MarkdownDocument {
  title: string;
  content: string;
  meta: MarkdownMeta;
}

export interface LineParserStrategy {
  canParse(line: string): boolean;
  parse(line: string, builder: MarkdownBuilder): void;
}

export interface ParserConfig {
  strategies?: LineParserStrategy[];
  defaultMeta?: Partial<MarkdownMeta>;
  preProcessHooks?: PreProcessHook[];
  postProcessHooks?: PostProcessHook[];
}

// Types
export type PreProcessHook = (markdown: string) => string;
export type PostProcessHook = (document: MarkdownDocument) => MarkdownDocument;

// Classes
export class TitleParser implements LineParserStrategy {
  canParse(line: string): boolean {
    // Must start with '# ' and have non-whitespace content after the space
    const trimmed = line.trim();
    return trimmed.startsWith('# ') && trimmed.length > 2 && /^#\s+\S/.test(line);
  }

  parse(line: string, builder: MarkdownBuilder): void {
    const title = line.replace(/^#\s+/, '').trim();
    builder.setTitle(title);
  }
}

export class TagsParser implements LineParserStrategy {
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

export class ContentSectionParser implements LineParserStrategy {
  public isInContentSection = false;

  canParse(line: string): boolean {
    const trimmedLine = line.trim();

    const contentHeaderRegex = /^## content[ \t]*$/i;
    const sectionHeaderRegex = /^## (?!content\b).+/i;

    if (contentHeaderRegex.test(trimmedLine)) {
      // Enter the content section
      this.isInContentSection = true;
      return true;
    } else if (sectionHeaderRegex.test(trimmedLine)) {
      // Another '##' header that is not '## content'; exit content section
      this.isInContentSection = false;
      return false;
    }

    // Remain in current state (inside or outside the content section)
    return this.isInContentSection;
  }

  parse(line: string, builder: MarkdownBuilder): void {
    if (this.isInContentSection) {
      builder.appendContent(line);
    }
  }
}

export class MarkdownBuilder {
  private document: MarkdownDocument;
  private contentLines: string[] = [];

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

  setTitle(title: string): void {
    this.document.title = title;
  }

  setTags(tags: string[]): void {
    this.document.meta.tags = tags;
  }

  appendContent(line: string): void {
    this.contentLines.push(line.trim() === '' ? '' : line);
  }

  build(): MarkdownDocument {
    this.document.content = this.contentLines.join('\n').trim();
    return { ...this.document };
  }
}

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
    this.preProcessHooks = config.preProcessHooks || [normalizeLineEndings, removeExtraWhitespace, convertTabsToSpaces, normalizeHeaders];
    this.postProcessHooks = config.postProcessHooks || [validateRequiredFields, addTimeToRead];
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

    // get content parser
    const contentParser = this.strategies.find(strategy => strategy instanceof ContentSectionParser);

    for (const line of lines) {
      // If we are inside the content section, give priority to the content parser
      if (contentParser && contentParser.canParse(line)) {
        contentParser.parse(line, builder);
        continue; // Move to the next line
      } else {
        // Check if we need to exit the content section
        // The content parser's canParse method handles state transitions
      }

      // Outside content section, try other parsers
      for (const parser of this.strategies) {
        if (parser !== contentParser && parser.canParse(line)) {
          parser.parse(line, builder);
          break; // Move to the next line after parsing
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


// Pre-process hooks
export const normalizeLineEndings: PreProcessHook = (markdown: string) => {
  return markdown.replace(/\r\n/g, '\n');
};

export const removeExtraWhitespace: PreProcessHook = (markdown: string) => {
  return markdown.replace(/\n\s*\n\s*\n/g, '\n\n');
};

export const convertTabsToSpaces: PreProcessHook = (markdown: string) => {
  return markdown.replace(/\t/g, '    ');
};

export const normalizeHeaders: PreProcessHook = (markdown: string) => {
  // This regex matches headers from # to ###### that are missing a space
  // between the hashes and the header text and inserts the space.
  return markdown.replace(/^(\#{1,6})([^\s#])/gm, '$1 $2');
};

// Post-process hooks
export const validateRequiredFields: PostProcessHook = (doc: MarkdownDocument) => {
  if (!doc.title) {
    throw new Error('Document must have a title');
  }
  if (!doc.content) {
    throw new Error('Document must have content');
  }
  return doc;
};

export const addTimeToRead: PostProcessHook = (doc: MarkdownDocument) => {
  const wordsPerMinute = 200;
  const wordCount = doc.content.split(/\s+/).length;
  const timeToRead = Math.ceil(wordCount / wordsPerMinute);

  return {
    ...doc,
    meta: {
      ...doc.meta,
      timeToRead: timeToRead
    }
  };
};