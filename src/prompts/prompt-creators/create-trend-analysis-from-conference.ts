import { PromptComposer } from "../prompt-composer";
import { BasePrompts } from "../templates/base-prompts";
import { SpecializedContentPrompts } from "../templates/specialized-content-prompts";
import { ToneStylePrompts } from "../templates/tone-style-prompts";
import { MetaContentPrompts } from "../templates/meta-content-prompts";

export async function createTrendAnalysisFromConference(conferenceData: {
  sessions: any[];
  speakerNotes: any[];
  pollResults: any;
  industryStats: any;
}) {
  const prompt = new PromptComposer(BasePrompts.contentAnalysis)
    .addComponent(SpecializedContentPrompts.trendAnalysis)
    .addComponent(ToneStylePrompts.storytelling)
    .addPurpose('thoughtLeadership')
    .addEnhancements(['engagement'])
    .addComponent(MetaContentPrompts.socialPromotion)
    .build();

  try {
    const formattedPrompt = await prompt.format({
      contentType: 'trend analysis',
      trend: conferenceData.sessions[0].mainTopic,
      sector: conferenceData.sessions[0].industry,
      timeframe: '12-18 months',
      content: JSON.stringify(conferenceData),
      voice: 'visionary',
      tone: 'insightful',
      complexity: 'sophisticated',
      platform: ['twitter', 'linkedin'],
      keywords: ['industry trends', 'future insights', 'market analysis'],
      searchIntent: 'research',
      targetLength: '2000 words'
    });

    return formattedPrompt;
  } catch (error: unknown) {
    console.error('Error formatting prompt:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}