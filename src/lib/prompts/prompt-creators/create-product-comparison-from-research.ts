import { PromptComposer } from "../prompt-composer";
import { BasePrompts } from "../templates/base-prompts";
import { SpecializedContentPrompts } from "../templates/specialized-content-prompts";
import { ToneStylePrompts } from "../templates/tone-style-prompts";
import { MetaContentPrompts } from "../templates/meta-content-prompts";

export async function createProductComparisonFromResearch(researchData: {
  products: string[];
  emails: any[];
  webClippings: any[];
  marketData: any;
}) {
  const prompt = new PromptComposer(BasePrompts.contentAnalysis)
    .addComponent(SpecializedContentPrompts.comparisonArticle)
    .addComponent(ToneStylePrompts.executive)
    .addPurpose('thoughtLeadership')
    .addEnhancements(['seoOptimization', 'engagement'])
    .addComponent(MetaContentPrompts.contentDistribution)
    .build();

  try {
    const formattedPrompt = await prompt.format({
      contentType: 'product comparison',
      items: researchData.products.join(', '),
      content: JSON.stringify(researchData),
      context: 'Market analysis and product comparison',
      audience: 'decision makers',
      voice: 'authoritative',
      tone: 'objective',
      complexity: 'detailed',
      channels: ['company blog', 'linkedin', 'email newsletter'],
      goals: ['lead generation', 'thought leadership'],
      keywords: [...researchData.products, 'comparison', 'analysis', 'review'],
      searchIntent: 'comparison',
      targetLength: '3000 words'
    });

    return formattedPrompt;
  } catch (error: unknown) {
    console.error('Error formatting prompt:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}