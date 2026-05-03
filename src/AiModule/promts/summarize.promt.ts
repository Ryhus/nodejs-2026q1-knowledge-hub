import { MaxArticleSummaryLength } from '../enums/ai.enums';

export function buildSummarizePrompt(
  content: string,
  maxLength: MaxArticleSummaryLength,
): string {
  const rules = {
    short: 'Summarize article in 1 sentence',
    medium: 'Summarize article clearly and concisely',
    detailed: 'Summarize article providing a detailed summary',
  };

  return `
  ${rules[maxLength]}

  Article:
  ${content}`;
}
