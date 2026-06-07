export type GeminiPart = {
  text: string;
};

export type GeminiContent = {
  parts: GeminiPart[];
};

export type GeminiCandidate = {
  content: GeminiContent;
};

export type GiminiUsageMetaData = {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
  promptTokensDetails: { modality: string; tokenCount: number }[];
};

export type GeminiResponse = {
  candidates: GeminiCandidate[];
  usageMetaData: GiminiUsageMetaData;
  modelVersion: string;
  responseId: string;
};
