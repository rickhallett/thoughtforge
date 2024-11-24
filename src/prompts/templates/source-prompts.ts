export const SourcePrompts = {
  email: `Process this email conversation:
From: {emailFrom}
Subject: {emailSubject}
Content: {emailContent}

Extract:
- Main discussion points
- Key decisions or conclusions
- Important context
- Action items`,

  voiceNote: `Transform this voice note transcription:
Duration: {duration}
Context: {context}
Transcript: {transcript}

Consider:
- Natural speech patterns to formal writing
- Filler word removal
- Coherent paragraph structuring
- Maintaining speaker's expertise`,

  webClipping: `Adapt this web content:
URL: {sourceUrl}
Type: {contentType}
Context: {clipContext}
Content: {clippedContent}

Focus on:
- Maintaining attribution
- Restructuring for blog format
- Adding original analysis
- Expanding key points`
};