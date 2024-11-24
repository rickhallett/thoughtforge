import { PromptComposer } from "../prompt-composer";
import { BasePrompts } from "../templates/base-prompts";

// Example for creating a tutorial from email content
export async function createEmailBasedTutorial(emailData: any) {
  const prompt = new PromptComposer(BasePrompts.contentAnalysis)
    .addComponent(BasePrompts.styleGuide)
    .addSourceProcessing('email')
    .addPurpose('educational')
    .addEnhancements(['seoOptimization', 'engagement'])
    .build();

  try {
    const formattedPrompt = await prompt.format({
      contentType: 'email',
      content: emailData.content,
      emailFrom: emailData.from,
      emailSubject: emailData.subject,
      emailContent: emailData.body,
      voice: 'authoritative',
      tone: 'friendly',
      complexity: 'intermediate',
      audience: 'developers',
      articleType: 'tutorial',
      keywords: ['tutorial', 'guide', 'development'],
      searchIntent: 'how-to',
      targetLength: '1500 words'
    });

    return formattedPrompt;
  } catch (error: unknown) {
    console.error('Error formatting prompt:', error instanceof Error ? error.message : String(error));
    throw error;
  }



}