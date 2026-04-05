import { InMemoryDb } from './inmemorydb';
import { InMemoSharedRepo } from './shared.repository';
import { Module } from '@nestjs/common';

@Module({
  providers: [InMemoryDb, InMemoSharedRepo],
  exports: [InMemoryDb, InMemoSharedRepo],
})
export class InmemoryDatabaseModule {}
