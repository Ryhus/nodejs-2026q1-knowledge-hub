export interface AiProvider {
  callLLM<T>(promt: string): Promise<T>;
}

export const AI_PROVIDER = Symbol('AI_PROVIDER');
