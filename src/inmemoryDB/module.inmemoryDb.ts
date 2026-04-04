import { InMemoryDb } from './inmemorydb';
import { Module } from '@nestjs/common';

@Module({
  providers: [InMemoryDb],
  exports: [InMemoryDb],
})
export class InmemoryDatabaseModule {}
