import { PromptTemplate } from "@langchain/core/prompts";
import { SourcePrompts } from "./templates/source-prompts";
import { PurposePrompts } from "./templates/purpose-prompts";
import { EnhancementPrompts } from "./templates/enhancement-prompts";

export interface PromptVariables {
  [key: string]: string | string[] | number | boolean | undefined;
}

export class PromptComposer {
  private baseTemplate: string = '';
  private components: string[] = [];
  private variables: Set<string> = new Set();

  constructor(baseTemplate?: string) {
    if (baseTemplate) {
      this.baseTemplate = baseTemplate;
      this.extractVariables(baseTemplate);
    }
  }

  addComponent(component: string): this {
    this.components.push(component);
    this.extractVariables(component);
    return this;
  }

  addSourceProcessing(source: keyof typeof SourcePrompts): this {
    const component = SourcePrompts[source];
    this.components.push(component);
    this.extractVariables(component);
    return this;
  }

  addPurpose(purpose: keyof typeof PurposePrompts): this {
    const component = PurposePrompts[purpose];
    this.components.push(component);
    this.extractVariables(component);
    return this;
  }

  addEnhancements(enhancements: (keyof typeof EnhancementPrompts)[]): this {
    enhancements.forEach(enhancement => {
      const component = EnhancementPrompts[enhancement];
      this.components.push(component);
      this.extractVariables(component);
    });
    return this;
  }

  private extractVariables(template: string): void {
    const matches = template.match(/\{([^}]+)\}/g) || [];
    matches.forEach(match => {
      const variable = match.slice(1, -1); // Remove { and }
      this.variables.add(variable);
    });
  }

  build(): LangChainPrompt {
    const template = [
      this.baseTemplate,
      ...this.components
    ].join('\n\n');

    return new LangChainPrompt(template, Array.from(this.variables));
  }
}

// Custom wrapper around LangChain's PromptTemplate for better type safety and usability
class LangChainPrompt {
  private template: string;
  private variables: string[];
  private promptTemplate: PromptTemplate;

  constructor(template: string, variables: string[]) {
    this.template = template;
    this.variables = variables;
    this.promptTemplate = PromptTemplate.fromTemplate(template);
  }

  async format(values: PromptVariables): Promise<string> {
    // Check for required variables
    const missingVars = this.variables.filter(v => !(v in values));
    if (missingVars.length > 0) {
      throw new Error(`Missing required variables: ${missingVars.join(', ')}`);
    }

    try {
      return await this.promptTemplate.format(values);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error formatting prompt: ${error.message}`);
      }
      throw new Error('Error formatting prompt: Unknown error occurred');
    }
  }

  // Get list of required variables
  getVariables(): string[] {
    return [...this.variables];
  }

  // Get the raw template
  getTemplate(): string {
    return this.template;
  }
}