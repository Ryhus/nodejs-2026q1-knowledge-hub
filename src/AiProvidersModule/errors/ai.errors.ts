export class AiError extends Error {
  constructor(
    message: string,
    public readonly error?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
  }
}

export class AiUnavailableError extends AiError {}
