import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntitySubscriberInterface, In, InsertEvent, Repository, UpdateEvent } from 'typeorm';
import { Project, ProjectStatus } from '../common/entities/project.entity';
import { TalentStatus, User } from '@/common/entities/user.entity';
import AssignedRoles from '@/common/entities/assignedRoles.entity';

@Injectable()
export class ProjectSubscriber implements EntitySubscriberInterface<Project> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AssignedRoles)
    private assignedRolesRepository: Repository<AssignedRoles>
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

  async afterUpdate(event: UpdateEvent<Project>): Promise<void> {
    console.log("After update project")
    this.updateTalentStatus(event);
  }

  async updateTalentStatus(event: UpdateEvent<Project>) {
    const assignedRoles = await this.assignedRolesRepository.find({
      where: { projectId: event.databaseEntity.id }
    });

    if (assignedRoles.length === 0) return;

    const talentIds = [...new Set(assignedRoles.map(ar => ar.talentId))];

    for (const talentId of talentIds) {
      const talentAssignments = await this.assignedRolesRepository.find({
        where: { talentId },
        relations: ['project'],
      }); 

      const hasActiveProject = talentAssignments.some(
        assignment => (assignment.project?.status === ProjectStatus.ONGOING || assignment.project?.status === ProjectStatus.CREATED)
      );

      const talent = await this.userRepository.findOne({ where: { id: talentId } });
      if (talent) {
        const newStatus = hasActiveProject ? TalentStatus.ACTIVE : TalentStatus.INACTIVE;

        if (talent.talentStatus !== newStatus) {
          talent.talentStatus = newStatus;
          await this.userRepository.save(talent);
        }
      }
    }
  }
}