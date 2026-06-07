import { Module } from '@nestjs/common';
import { CommentPrismaPsService } from './comments.service';
import { CommentController } from './comments.controller';
import { PrismaModule } from 'src/PrismaModule/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CommentController],
  providers: [CommentPrismaPsService],
})
export class CommentModule {}
