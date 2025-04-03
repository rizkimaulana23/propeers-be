import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from 'src/common/entities/content.entity';
import { Project } from 'src/common/entities/project.entity';
import { ProjectService } from 'src/project/project.service';
import { ProjectModule } from 'src/project/project.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Content, Project
    ]),
    ProjectModule
  ],
  providers: [ContentService],
  controllers: [ContentController]
})
export class ContentModule {}
