import { PromptComposer } from "../prompt-composer";
import { BasePrompts } from "../templates/base-prompts";
import { ContentStructurePrompts } from "../templates/content-structure-prompts";
import { ToneStylePrompts } from "../templates/tone-style-prompts";
import { PromptParams } from "../types";

interface TechnicalTutorialData {
  transcript: string;
  context: string;
  duration: string;
  participants: string[];
  techStack: string[];
}

export async function createTechnicalTutorialFromMeeting(
  meetingData: TechnicalTutorialData
): Promise<string> {
  // Create the prompt template
  const composer = new PromptComposer(BasePrompts.contentAnalysis)
    .addSourceProcessing('voiceNote')
    .addComponent(ContentStructurePrompts.howToGuide)
    .addComponent(ToneStylePrompts.conversational)
    .addPurpose('technical');

  const prompt = composer.build();

  // Log required variables for debugging
  console.log('Required variables:', prompt.getVariables());

  // Prepare variables
  const promptVariables: PromptParams = {
    contentType: 'technical tutorial',
    content: meetingData.transcript,
    context: `Team discussion about ${meetingData.context}`,
    duration: meetingData.duration,
    transcript: meetingData.transcript,
    voice: 'expert but approachable',
    tone: 'helpful',
    complexity: 'intermediate',
    audience: 'developers',
    articleType: 'tutorial',
    keywords: [...meetingData.techStack, 'tutorial', 'guide', 'development'],
    searchIntent: 'how-to',
    targetLength: '2500 words'
  };

  try {
    // Format the prompt with our variables
    const formattedPrompt = await prompt.format(promptVariables);
    return formattedPrompt;
  } catch (error) {
    console.error('Error creating technical tutorial prompt:', error);
    throw error;
  }
}