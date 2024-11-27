export class MockContentParser {
  async parse(content: string): Promise<string> {
    return `Standardized: ${content}`;
  }
}
