import { Module } from '@nestjs/common';
import { AppLoggerService } from './appLogger.service';

@Module({
  providers: [AppLoggerService],
  exports: [AppLoggerService],
})
export class AppLoggerModule {}
