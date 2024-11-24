export const ContentStructurePrompts = {
  howToGuide: `Structure this how-to guide:
Content: {content}

Format as:
1. Introduction
   - Problem statement
   - Why this solution matters
   - Who this guide is for

2. Prerequisites
   - Required knowledge
   - Required tools/resources
   - Time commitment

3. Step-by-Step Instructions
   - Clear, numbered steps
   - Code snippets or examples
   - Common pitfalls
   - Troubleshooting tips

4. Alternative Approaches
   - Other methods
   - Pros and cons
   - When to use each

5. Conclusion
   - Summary of benefits
   - Next steps
   - Additional resources`,

  caseStudy: `Structure this case study:
Content: {content}

Format as:
1. Executive Summary
   - Key outcomes
   - Core challenges
   - Solution overview

2. Background
   - Context
   - Initial situation
   - Key stakeholders

3. Challenge Analysis
   - Problem breakdown
   - Impact assessment
   - Attempted solutions

4. Solution Implementation
   - Approach
   - Key decisions
   - Timeline
   - Resources used

5. Results
   - Quantitative outcomes
   - Qualitative benefits
   - Testimonials/feedback

6. Lessons Learned
   - Key insights
   - Best practices
   - Future recommendations`,

  productReview: `Structure this product review:
Content: {content}

Format as:
1. Quick Verdict
   - Rating
   - Pros/Cons
   - Best suited for

2. Product Overview
   - Key features
   - Technical specifications
   - Target audience

3. Detailed Analysis
   - Performance metrics
   - User experience
   - Build quality
   - Value proposition

4. Comparative Analysis
   - Market alternatives
   - Price comparison
   - Feature comparison

5. Use Cases
   - Ideal scenarios
   - Limitations
   - Real-world examples

6. Final Verdict
   - Recommendations
   - Who should buy
   - Who should skip`
};