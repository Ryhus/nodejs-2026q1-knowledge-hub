import { AnalyzeArticleTask } from '../enums/ai.enums';

export function buildAnalizePrompt(
  content: string,
  task: AnalyzeArticleTask,
): string {
  const rules = {
    review: 'Review the content.',
    bugs: 'Find bugs.',
    optimize: 'Optimize the content or code.',
    explain: 'Explain the content.',
  };
  return `

${rules[task]}

You MUST respond with ONLY valid JSON.
Do NOT include markdown, backticks, or any extra text.

JSON schema:

{
  "analysis": string,
  "suggestions": string[],
  "severity": "info" | "warning" | "error"
}

Rules:
- "analysis" = short explanation of findings
- "suggestions" = array of short actionable suggestions
- "severity" = choose exactly one: info, warning, error
- If no issues found → return empty suggestions array
- Output must be valid JSON only

Content:
${content}

`;
}
