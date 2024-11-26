interface MarkdownMeta {
  tags?: string[];
  lastUpdated?: string; // ISO format
}

interface MarkdownDocument {
  title: string;
  content: string;
  meta: MarkdownMeta;
}

export function parseMarkdown(markdown: string): MarkdownDocument {
  const lines = markdown.split('\n');
  let title = '';
  let content = '';
  const meta: MarkdownMeta = {
    tags: [],
    lastUpdated: new Date().toISOString()
  };

  let currentSection: 'title' | 'content' | null = null;
  let contentBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Parse tags if line starts with "tags:"
    if (line.toLowerCase().startsWith('tags:')) {
      const tagsString = line.substring(5).trim();
      meta.tags = tagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      continue;
    }

    // Parse H1 title
    if (line.startsWith('# ')) {
      title = line.replace('# ', '');
      continue;
    }

    // Parse H2 sections
    if (line.startsWith('## ')) {
      // Save previous section if exists
      if (currentSection === 'content') {
        content = contentBuffer.join('\n').trim();
      }

      // Start new section
      contentBuffer = [];
      const sectionName = line.replace('## ', '').toLowerCase();
      
      if (sectionName === 'content') {
        currentSection = 'content';
      } else {
        currentSection = null;
      }
      continue;
    }

    // Add line to current section buffer
    if (currentSection) {
      contentBuffer.push(line);
    }
  }

  // Save last section if exists
  if (currentSection === 'content') {
    content = contentBuffer.join('\n').trim();
  }

  return {
    title,
    content,
    meta
  };
}