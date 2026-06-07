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
  return `${rules[task]}.Make short suggestions.Label the analysis in one of the labels: info, warning, error. Respond with the valid JSON and don't put the object in markdown blocks.
  {"analysis":"your analysis", "suggestions":"the array of your short suggestions", "severity":"one of three severity labels"}

  Content:
  ${content}
  `;
}
