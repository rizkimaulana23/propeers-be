import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntitySubscriberInterface, In, InsertEvent, Repository, SoftRemoveEvent, UpdateEvent } from 'typeorm';
import { Project, ProjectStatus } from '../common/entities/project.entity';
import { TalentStatus, User } from '@/common/entities/user.entity';
import AssignedRoles from '@/common/entities/assignedRoles.entity';

@Injectable()
export class AssignedRolesSubscribers implements EntitySubscriberInterface<AssignedRoles> {
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
    return AssignedRoles;
  }

  async afterUpdate(event: UpdateEvent<AssignedRoles>): Promise<void> {
    console.log("After update assigned roles")
    this.updateTalentStatus(event.databaseEntity);
  }

  async afterInsert(event: InsertEvent<AssignedRoles>): Promise<void> {
    console.log("After insert assigned roles")
    this.updateTalentStatus(event.entity);
  }

  async afterSoftRemove(event: SoftRemoveEvent<AssignedRoles>): Promise<void> {
    console.log("After soft remove assigned roles")
    this.updateTalentStatus(event.databaseEntity);
  }

  async updateTalentStatus(assignedRoles: AssignedRoles) {
    const talent = await this.userRepository.findOne({
        where: {
            id: assignedRoles.talentId
        }
    })

    if (!talent) return;

    const ars = await this.assignedRolesRepository.find({
        where: {
            talentId: talent.id
        }
    })

    const projects = await this.projectRepository.find({
        where: {
            id: In(ars.map(ar => ar.projectId))
        }
    })

    talent.talentStatus = TalentStatus.INACTIVE;
    for (const project of projects) {
        if (project.status === ProjectStatus.CREATED || project.status === ProjectStatus.ONGOING) {
            talent.talentStatus = TalentStatus.ACTIVE;
        }
    }

    await this.userRepository.save(talent);
  }
}