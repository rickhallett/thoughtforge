import { PromptComposer } from "../prompt-composer";
import { BasePrompts } from "../templates/base-prompts";
import { MetaContentPrompts } from "../templates/meta-content-prompts";
import { ToneStylePrompts } from "../templates/tone-style-prompts";

export async function createMultiPlatformFromWebinar(webinarData: {
  recording: string;
  slides: any[];
  qa: any[];
  attendeeData: any;
}) {
  const prompt = new PromptComposer(BasePrompts.contentAnalysis)
    .addSourceProcessing('voiceNote')
    .addComponent(MetaContentPrompts.contentDistribution)
    .addComponent(ToneStylePrompts.conversational)
    .addPurpose('educational')
    .addEnhancements(['seoOptimization', 'engagement'])
    .build();

  try {
    const formattedPrompt = await prompt.format({
      contentType: 'multi-platform content',
      content: webinarData.recording,
      channels: [
        'blog',
        'youtube',
        'linkedin',
        'twitter',
        'email newsletter'
      ],
      voice: 'expert',
      tone: 'engaging',
      complexity: 'varied by platform',
      audience: 'mixed',
      goals: ['education', 'lead generation', 'brand awareness'],
      keywords: ['webinar', 'expert insights', 'industry knowledge'],
      searchIntent: 'learn',
      targetLength: 'varied by platform'
    });

    return formattedPrompt;
  } catch (error: unknown) {
    console.error('Error formatting prompt:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}