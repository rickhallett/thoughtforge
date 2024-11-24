export const BasePrompts = {
  contentAnalysis: `Analyze the following {contentType} content:
{content}

Focus on:
- Main topic and subtopics
- Key arguments or points
- Writing style and tone
- Target audience indicators
- Content structure`,

  styleGuide: `Apply the following style guidelines:
- Voice: {voice}
- Tone: {tone}
- Complexity Level: {complexity}
- Target Audience: {audience}
- Article Type: {articleType}`,

  formatGuide: `Format the output as:
- Title: Engaging, SEO-friendly
- Introduction: Hook + context
- Body: Clear sections with subheadings
- Conclusion: Summary + call-to-action
- Metadata: Keywords, tags, description`
};