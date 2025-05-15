import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntitySubscriberInterface, InsertEvent, Repository } from 'typeorm';
import { Project, ProjectStatus } from '../common/entities/project.entity';

@Injectable()
export class ProjectSubscriber implements EntitySubscriberInterface<Project> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Project;
  }

  async afterInsert(event: InsertEvent<Project>): Promise<void> {
    const project = event.entity;
    
    if (!project) return;
    
    const startDate = new Date(project.startDate);
    const currentDate = new Date();
    
    if (startDate.getTime() <= currentDate.getTime() && project.status === ProjectStatus.CREATED) {
        project.status = ProjectStatus.ONGOING;
        await event.manager.save(project);
    }
  }
}