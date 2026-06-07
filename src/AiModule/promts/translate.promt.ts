export function buildTranslatePrompt(
  content: string,
  targetLanguage: string,
  sourceLanguage?: string,
): string {
  return `
  Translate the article from ${sourceLanguage} or detected language to ${targetLanguage}.Detect the source language.
  Respond with the valid JSON and don't put the object in markdown blocks.
  {"translatedText":"translatedText", "detectedLanguage":"detectedLanguage"}
  
  Article:
  ${content}
  `;
}
