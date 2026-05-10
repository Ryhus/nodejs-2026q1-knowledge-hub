export interface TextGenerationProvider {
  generate<T>(
    promt: string,
    context?: any[],
    systemInstruction?: string,
  ): Promise<T>;
}

export interface EmbeddingProvider {
  embed<T>(data: string[] | string): Promise<T>;
}

export const TEXT_GENERATION_PROVIDER = Symbol('TEXT_GENERATION_PROVIDER');
export const EMBEDDING_PROVIDER = Symbol('EMBEDDING_PROVIDER');
