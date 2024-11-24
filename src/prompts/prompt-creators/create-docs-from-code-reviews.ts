import { PromptComposer } from "../prompt-composer";
import { BasePrompts } from "../templates/base-prompts";
import { ContentStructurePrompts } from "../templates/content-structure-prompts";
import { ToneStylePrompts } from "../templates/tone-style-prompts";

export async function createDocumentationFromCodeReviews(reviewData: {
  pullRequests: any[];
  comments: any[];
  codeSnippets: any[];
  testCases: any[];
}) {
  const prompt = new PromptComposer(BasePrompts.contentAnalysis)
    .addComponent(ContentStructurePrompts.howToGuide)
    .addComponent(ToneStylePrompts.academic)
    .addPurpose('technical')
    .addEnhancements(['seoOptimization'])
    .build();

  try {
    const formattedPrompt = await prompt.format({
      contentType: 'technical documentation',
      content: JSON.stringify(reviewData),
      voice: 'technical',
      tone: 'precise',
      complexity: 'advanced',
      audience: 'senior developers',
      articleType: 'documentation',
      keywords: ['api', 'documentation', 'development', 'integration'],
      searchIntent: 'implementation',
      targetLength: '4000 words'
    });

    return formattedPrompt;
  } catch (error: unknown) {
    console.error('Error formatting prompt:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}