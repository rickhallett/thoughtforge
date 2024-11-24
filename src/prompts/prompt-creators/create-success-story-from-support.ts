import { BasePrompts } from "../templates/base-prompts";
import { PromptComposer } from "../prompt-composer";
import { ContentStructurePrompts } from "../templates/content-structure-prompts";
import { ToneStylePrompts } from "../templates/tone-style-prompts";
import { MetaContentPrompts } from "../templates/meta-content-prompts";

export async function createSuccessStoryFromSupport(supportData: {
  tickets: any[];
  customerFeedback: any[];
  metrics: any;
  timeline: any;
}) {
  const prompt = new PromptComposer(BasePrompts.contentAnalysis)
    .addComponent(ContentStructurePrompts.caseStudy)
    .addComponent(ToneStylePrompts.storytelling)
    .addPurpose('thoughtLeadership')
    .addEnhancements(['engagement'])
    .addComponent(MetaContentPrompts.emailNewsletter)
    .build();

  try {
    const formattedPrompt = await prompt.format({
      contentType: 'case study',
      content: JSON.stringify(supportData),
      voice: 'empathetic',
      tone: 'inspiring',
      complexity: 'moderate',
      audience: 'potential customers',
      articleType: 'success story',
      context: 'Customer success journey',
      keywords: ['case study', 'success story', 'customer experience'],
      searchIntent: 'social proof',
      targetLength: '1500 words'
    });

    return formattedPrompt;
  } catch (error: unknown) {
    console.error('Error formatting prompt:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}