import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';
import { Submission } from '../common/entities/submission.entity';
import { Content } from '../common/entities/content.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission, Content])
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
  exports: [SubmissionService],
})
export class SubmissionModule {}
