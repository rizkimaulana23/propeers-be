import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from 'src/common/entities/content.entity';
import { Project } from 'src/common/entities/project.entity';
import { ProjectService } from 'src/project/project.service';
import { ProjectModule } from 'src/project/project.module';
import { SubmissionSubscriber } from './submission.subscribers';
import { Submission } from '@/common/entities/submission.entity';
import { NotificationModule } from '@/notification/notification.module';
import AssignedRoles from '@/common/entities/assignedRoles.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Content, Project, Submission, AssignedRoles
    ]),
    NotificationModule,
    ProjectModule
  ],
  providers: [
    ContentService,
    SubmissionSubscriber
  ],
  controllers: [ContentController]
})
export class ContentModule {}
