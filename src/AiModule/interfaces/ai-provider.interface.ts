export interface AiProvider {
  callLLM<T>(promt: string, context?: any[]): Promise<T>;
}

export const AI_PROVIDER = Symbol('AI_PROVIDER');
