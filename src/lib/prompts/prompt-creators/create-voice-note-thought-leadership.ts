import { PromptComposer } from "../prompt-composer";
import { BasePrompts } from "../templates/base-prompts";

export async function createVoiceNoteThoughtLeadership(voiceData: any) {
  const prompt = new PromptComposer(BasePrompts.contentAnalysis)
    .addSourceProcessing('voiceNote')
    .addPurpose('thoughtLeadership')
    .addEnhancements(['engagement'])
    .build();

  try {
    const formattedPrompt = await prompt.format({
      contentType: 'voice note',
      content: voiceData.transcript,
      duration: voiceData.duration,
      context: voiceData.context,
      transcript: voiceData.transcript
    });

    return formattedPrompt;
  } catch (error: unknown) {
    console.error('Error formatting prompt:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}