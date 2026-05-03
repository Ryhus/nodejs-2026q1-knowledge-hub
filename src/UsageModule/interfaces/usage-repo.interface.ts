export interface UsageRepo {
  setRequestData(domain: string, endpoint: string): void | Promise<void>;

  getDomain(domain: string);
}

export const USAGE_REPO = Symbol('USAGE_REPO');
