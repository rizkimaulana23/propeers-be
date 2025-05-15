// src/project/project-scheduler.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Project, ProjectStatus } from 'src/common/entities/project.entity';

@Injectable()
export class ProjectSchedulerService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async scheduledStatusUpdate() {
    const currentDate = new Date();
    
    await this.projectRepository
      .createQueryBuilder()
      .update(Project)
      .set({ status: ProjectStatus.ONGOING })
      .where('status = :status', { status: ProjectStatus.CREATED })
      .andWhere('startDate <= :currentDate', { currentDate })
      .execute();
      
    console.log('Project statuses updated at:', new Date().toISOString());
  }
}