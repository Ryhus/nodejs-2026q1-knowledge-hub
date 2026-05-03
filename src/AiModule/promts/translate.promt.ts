export function buildTranslatePrompt(
  content: string,
  targetLanguage: string,
  sourceLanguage?: string,
): string {
  return `

Translate the article into ${targetLanguage}.
If source language is not ${sourceLanguage}, detect it automatically.

You MUST respond with ONLY valid JSON.
Do NOT include markdown, backticks, explanations, or extra text.

JSON schema:

{
  "translatedText": string,
  "detectedLanguage": string
}

Rules:

- "translatedText" must contain ONLY the translated article
- "detectedLanguage" must be the language name in English (e.g., "English", "German")
- Do not include the original text
- Do not wrap the response in code blocks
- Output must be strictly valid JSON

Article:
${content}

`;
}
