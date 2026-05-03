import { Injectable } from '@nestjs/common';
import { UsageRepo } from '../interfaces/usage-repo.interface';

@Injectable()
export class UsageInMemoryRepo implements UsageRepo {
  private store = {
    ai: {
      totalRequests: 0,
      endpoints: {},
      tokensUsed: 0,
    },
  };

  setRequestData(domain: string, endpoint: string) {
    this.store[domain].totalRequests += 1;

    if (!this.store[domain].endpoints[endpoint]) {
      this.store[domain].endpoints[endpoint] = 0;
    }

    this.store[domain].endpoints[endpoint] += 1;
  }

  getDomain(domain: string) {
    return this.store[domain];
  }
}
