import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/common/entities/project.entity';
import { ProjectReferences } from 'src/common/entities/projectReferences.entity';
import { Activity } from 'src/common/entities/activity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project, ProjectReferences, Activity
    ])
  ],
  controllers: [ProjectController],
  providers: [ProjectService]
})
export class ProjectModule {}
