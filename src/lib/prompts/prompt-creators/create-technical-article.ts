import { PromptComposer } from "../prompt-composer";
import { BasePrompts } from "../templates/base-prompts";

export async function createTechnicalArticle(webData: any) {
  const prompt = new PromptComposer(BasePrompts.contentAnalysis)
    .addSourceProcessing('webClipping')
    .addPurpose('technical')
    .addEnhancements(['seoOptimization', 'engagement'])
    .build();

  try {
    const formattedPrompt = await prompt.format({
      contentType: 'technical article',
      content: webData.content,
      sourceUrl: webData.url,
      clipContext: webData.context,
      clippedContent: webData.content,
      keywords: ['technical', 'programming', 'development'],
      searchIntent: 'learn',
      targetLength: '2000 words'
    });

    return formattedPrompt;
  } catch (error: unknown) {
    console.error('Error formatting prompt:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}