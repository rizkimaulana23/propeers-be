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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project, ProjectReferences, Activity, User
    ]),
    UserModule 
  ],
  controllers: [ProjectController],
  providers: [ProjectService]
})
export class ProjectModule {}
