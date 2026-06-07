type TranslationAiResponse = {
  translatedText: string;
  detectedLanguage: string;
};

type AnalysisAIResponse = {
  analysis: string;
  suggestions: string[];
  severity: 'info' | 'warning' | 'error';
};

function safeParseJson(text: string): any | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function validateTranslation(raw: string): TranslationAiResponse {
  const parsed = safeParseJson(raw);

  if (
    parsed &&
    typeof parsed === 'object' &&
    typeof parsed.detectedLanguage === 'string' &&
    typeof parsed.translatedText === 'string'
  ) {
    return parsed;
  }

  return {
    detectedLanguage: 'unknown',
    translatedText: raw,
  };
}

export function validateAnalysis(raw: string): AnalysisAIResponse {
  const parsed = safeParseJson(raw);

  if (
    parsed &&
    typeof parsed === 'object' &&
    typeof parsed.analysis === 'string' &&
    Array.isArray(parsed.suggestions) &&
    parsed.suggestions.every((s: any) => typeof s === 'string') &&
    ['info', 'warning', 'error'].includes(parsed.severity)
  ) {
    return parsed;
  }

  return {
    analysis: raw,
    suggestions: [],
    severity: 'info',
  };
}
