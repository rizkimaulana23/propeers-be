import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from 'src/common/entities/content.entity';
import { Project } from 'src/common/entities/project.entity';
import { ProjectService } from 'src/project/project.service';
import { ProjectModule } from 'src/project/project.module';
import { NotificationModule } from '@/notification/notification.module';
import AssignedRoles from '@/common/entities/assignedRoles.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Content, Project, AssignedRoles
    ]),
    NotificationModule,
    ProjectModule
  ],
  providers: [ContentService],
  controllers: [ContentController]
})
export class ContentModule {}
