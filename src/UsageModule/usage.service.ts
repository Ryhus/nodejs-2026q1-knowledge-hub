import { Injectable, Inject } from '@nestjs/common';
import { USAGE_REPO, UsageRepo } from './interfaces/usage-repo.interface';
import { TrackerDataInput } from './usage.service.types';

@Injectable()
export class UsageService {
  constructor(@Inject(USAGE_REPO) private readonly repo: UsageRepo) {}

  track(input: TrackerDataInput) {
    const { domain, endpoint } = input;

    if (domain === 'ai') {
      this.repo.setRequestData(domain, endpoint);
    }
  }
}
