import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/common/entities/project.entity';
import { ProjectReferences } from 'src/common/entities/projectReferences.entity';
import { Activity } from 'src/common/entities/activity.entity';
import { User } from 'src/common/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { Speciality } from 'src/common/entities/speciality.entity';
import { ProjectSubscriber } from './project.subscribers';
import { ProjectSchedulerService } from './project.schedulers';
import { Content } from '@/common/entities/content.entity';
import AssignedRoles from '@/common/entities/assignedRoles.entity';
import { AssignedRolesSubscribers } from './assignedRoles.subscribers';
import { Submission } from '@/common/entities/submission.entity';
import { NotificationModule } from '@/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project, ProjectReferences, Activity, User, Content, AssignedRoles, Submission
    ]),
    NotificationModule,
    UserModule 
  ],
  controllers: [ProjectController],
  providers: [
    ProjectService, 
    ProjectSubscriber,
    ProjectSchedulerService,
    AssignedRolesSubscribers
  ],
  exports: [ProjectService] 
})
export class ProjectModule {}
