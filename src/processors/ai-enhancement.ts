import { logger } from '../logger/logger';
import { ProcessedContent } from '../types/content';
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import { OutputFixingParser } from "langchain/output_parsers";
import { OpenAI } from "@langchain/openai";
import { z } from "zod";
import * as fs from 'fs/promises';
import * as path from 'path';
import { StringOutputParser } from "@langchain/core/output_parsers";

import dotenv from 'dotenv';
dotenv.config();

export interface AIEnhancementOptions {
  generateSummary?: boolean;
  extractKeywords?: boolean;
  expandContent?: boolean;
  improveReadability?: boolean;
  temperature?: number;
}

interface EnhancementPrompts {
  [key: string]: string;
}

export class AIEnhancementProcessor {
  private llm: OpenAI;
  private prompts: EnhancementPrompts = {};

  constructor(apiKey?: string) {
    this.llm = new OpenAI({
      openAIApiKey: apiKey || process.env.OPENAI_API_KEY,
      temperature: 0.7,
      modelName: 'gpt-4o-mini'
    });
  }

  private async loadPrompts(): Promise<void> {
    try {
      const promptsDir = path.join(process.cwd(), 'src', 'lib', 'prompts', 'templates');

      // create array of all file names in prompts directory
      const files = await fs.readdir(promptsDir);

      // read each file and store in prompts object
      this.prompts = Object.fromEntries(await Promise.all(files.map(async (file) => {
        return [
          file.split('.')[0],
          await fs.readFile(path.join(promptsDir, file), 'utf-8')
        ];
      })));

      logger.debug('Prompts loaded successfully');
    } catch (error) {
      logger.error('Failed to load prompts', { error });
      throw new Error('Failed to load prompt templates');
    }
  }

  async process(
    content: ProcessedContent,
    options: AIEnhancementOptions = {
      generateSummary: true,
      extractKeywords: true,
      expandContent: false,
      improveReadability: true,
      temperature: 0.7
    }
  ): Promise<ProcessedContent> {
    logger.debug('Starting AI enhancement', {
      contentId: content.id,
      options
    });

    try {
      // Ensure prompts are loaded before processing
      if (!this.prompts) {
        await this.loadPrompts();
      }

      const enhancedContent = { ...content };
      const tasks: Promise<void>[] = [];

      if (options.generateSummary) {
        tasks.push(this.addSummary(enhancedContent));
      }

      if (options.extractKeywords) {
        tasks.push(this.addKeywords(enhancedContent));
      }

      if (options.expandContent) {
        tasks.push(this.expandContent(enhancedContent));
      }

      if (options.improveReadability) {
        tasks.push(this.improveReadability(enhancedContent));
      }

      await Promise.all(tasks);

      logger.info('AI enhancement completed', {
        contentId: content.id,
        enhancements: Object.keys(options).filter(key => options[key])
      });

      return enhancedContent;

    } catch (error) {
      logger.error('AI enhancement failed', {
        contentId: content.id,
        error
      });
      throw error;
    }
  }

  private async addSummary(content: ProcessedContent): Promise<void> {
    const summaryPrompt = PromptTemplate.fromTemplate(this.prompts.summary);
    const chain = summaryPrompt.pipe(this.llm).pipe(new StringOutputParser());

    const result = await chain.invoke({
      content: content.body
    });

    content.metadata.summary = result.trim();
  }

  private async addKeywords(content: ProcessedContent): Promise<void> {
    const parser = StructuredOutputParser.fromZodSchema(
      z.array(z.object({
        keyword: z.string(),
        relevance: z.number(),
        related: z.array(z.string())
      }))
    );

    const formatInstructions = parser.getFormatInstructions();
    const keywordPrompt = PromptTemplate.fromTemplate(
      `${this.prompts.keywords}\n\n${formatInstructions}`
    );

    const chain = keywordPrompt.pipe(this.llm);
    const result = await chain.invoke({ content: content.body });

    try {
      const keywords = await parser.parse(result);
      content.metadata.keywords = keywords;
    } catch (e) {
      const fixingParser = OutputFixingParser.fromLLM(this.llm, parser);
      content.metadata.keywords = await fixingParser.parse(result);
    }
  }

  private async expandContent(content: ProcessedContent): Promise<void> {
    const expansionPrompt = PromptTemplate.fromTemplate(this.prompts.expansion);
    const chain = expansionPrompt.pipe(this.llm);

    const result = await chain.invoke({
      content: content.body
    });

    content.metadata.originalContent = content.body;
    content.body = result.trim();
  }

  private async improveReadability(content: ProcessedContent): Promise<void> {
    const parser = StructuredOutputParser.fromZodSchema(
      z.object({
        score: z.number(),
        suggestions: z.array(z.string()),
        analysis: z.object({
          sentenceComplexity: z.string(),
          paragraphStructure: z.string(),
          vocabularyUsage: z.string(),
          voiceAndTone: z.string()
        })
      })
    );

    const formatInstructions = parser.getFormatInstructions();
    const readabilityPrompt = PromptTemplate.fromTemplate(
      `${this.prompts.readability}\n\n${formatInstructions}`
    );

    const chain = readabilityPrompt.pipe(this.llm);
    const result = await chain.invoke({ content: content.body });

    try {
      const readabilityAnalysis = await parser.parse(result);
      content.metadata.readability = readabilityAnalysis;
    } catch (e) {
      const fixingParser = OutputFixingParser.fromLLM(this.llm, parser);
      content.metadata.readability = await fixingParser.parse(result);
    }
  }

  // Helper method to chunk content for token limits
  private chunkContent(content: string, maxChunkSize: number = 1000): string[] {
    const paragraphs = content.split('\n\n');
    const chunks: string[] = [];
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if ((currentChunk + paragraph).length <= maxChunkSize) {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      } else {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = paragraph;
      }
    }

    if (currentChunk) chunks.push(currentChunk);
    return chunks;
  }
}