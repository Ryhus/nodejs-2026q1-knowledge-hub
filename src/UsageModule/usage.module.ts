import { Module } from '@nestjs/common';
import { UsageService } from './usage.service';
import { USAGE_REPO } from './interfaces/usage-repo.interface';
import { UsageInMemoryRepo } from './repos/inMemory.repo';

@Module({
  providers: [
    UsageInMemoryRepo,
    { provide: USAGE_REPO, useClass: UsageInMemoryRepo },
    UsageService,
  ],
  exports: [UsageService],
})
export class UsageModule {}
