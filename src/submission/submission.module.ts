import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';
import { Submission } from '../common/entities/submission.entity';
import { Content } from '../common/entities/content.entity';
import { User } from '@/common/entities/user.entity';
import AssignedRoles from '@/common/entities/assignedRoles.entity';
import { Project } from '@/common/entities/project.entity';
import { NotificationModule } from '@/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Submission, 
      Content, 
      User, // Add User here
      AssignedRoles, // Add AssignedRoles here
      Project // Add Project here
    ]),
    NotificationModule, // Import NotificationModule
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
  exports: [SubmissionService],
})
export class SubmissionModule {}
