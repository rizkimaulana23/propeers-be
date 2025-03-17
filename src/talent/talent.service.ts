import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/common/entities/project.entity';
import { Role, User, TalentStatus } from 'src/common/entities/user.entity';
import { In, Repository } from 'typeorm';
import { FailedException } from 'src/common/exceptions/FailedExceptions.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { CreateAssignedRoleDto } from './dto/request/create-assigned-role.dto';
import { BaseUserResponseDto } from 'src/user/dto/response/user-response.dto';
import { DetailTalentResponseDTO } from './dto/response/talent-detail-response.dto';
import AssignedRoles from 'src/common/entities/assignedRoles.entity';
// import { AssignedRoleResponseDto } from './dto/response/assigned-role-response.dto';

@Injectable()
export class TalentService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AssignedRoles)
    private readonly assignedRolesRepository: Repository<AssignedRoles>,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async createAssignedRole(createAssignedRole: CreateAssignedRoleDto) {
    const { talentId, projectId, role } = createAssignedRole;

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project)
      throw new FailedException(
        `Project dengan ID ${projectId} tidak ditemukan`,
        HttpStatus.NOT_FOUND,
        this.request.path,
      );

    const talent = await this.userRepository.findOne({
      where: { id: talentId },
      relations: ['assignedRoles', 'assignedRoles.project'],
    });
    if (!talent)
      throw new FailedException(
        `Talent dengan ID ${talentId} tidak ditemukan`,
        HttpStatus.NOT_FOUND,
        this.request.path,
      );

    // Validasi Role agar sesuai dengan Specialities talent
    const specialities = talent.specialities.map((s) => s.speciality);
    if (!specialities.includes(role)) {
      throw new FailedException(
        `Role ${role} tidak sesuai dengan specialities talent`,
        HttpStatus.BAD_REQUEST,
        this.request.path,
      );
    }

    // Validate talent jika sudah di-assign ke project
    const existingAssignment = talent.assignedRoles.find(
      (a) => a.projectId === projectId,
    );
    if (existingAssignment) {
      throw new FailedException(
        `Talent dengan ID ${talentId} sudah di-assign ke project dengan ID ${projectId}`,
        HttpStatus.BAD_REQUEST,
        this.request.path,
      );
    }

    // Validate hanya 1 SMS yang bisa di-assign ke 1 project
    const smsAssignment = await this.assignedRolesRepository.findOne({
      where: { projectId: projectId, role: Role.SMS },
    });
    if (smsAssignment) {
      throw new FailedException(
        `Hanya satu talent dengan role SMS yang bisa di-assign ke project dengan ID ${projectId}`,
        HttpStatus.BAD_REQUEST,
        this.request.path,
      );
    }

    const briefNotesUrl = 'link';

    const assignedRole = this.assignedRolesRepository.create({
      talent: talent,
      project: project,
      role: role,
      briefNotesUrl: briefNotesUrl,
    });

    await this.assignedRolesRepository.save(assignedRole);
    talent.assignedRoles.push(assignedRole);

    return this.turnTalentToTalentResponse(talent);
  }

  turnTalentToTalentResponse(talent: User) {
    if (!talent) return undefined;

    const specialities = talent.specialities?.map((s) => s.speciality) || [];
    const assignedRoles =
      talent.assignedRoles?.map((a) => ({
        projectId: a.projectId,
        projectName: a.project?.projectName,
        projectStatus: a.project?.status,
        roleName: a.role,
        briefNotes: a.briefNotesUrl,
        talentStatusPerProject:
          a.project?.status === 'CREATED' || a.project?.status === 'ONGOING'
            ? 'ACTIVE'
            : 'INACTIVE',
      })) || [];

    const activeProjectsCount = assignedRoles.filter(
      (a) => a.projectStatus === 'CREATED' || a.projectStatus === 'ONGOING',
    ).length;

    const successProjectsCount = assignedRoles.filter(
      (a) => a.projectStatus === 'FINISHED',
    ).length;

    // Temporary solution to determine talent status
    if (activeProjectsCount > 0) {
      talent.talentStatus = TalentStatus.ACTIVE;
    } else if (activeProjectsCount === 0) {
      talent.talentStatus = TalentStatus.INACTIVE;
    }

    let TalentResponse = new DetailTalentResponseDTO({
      id: talent.id,
      email: talent.email,
      description: talent.description,
      name: talent.name,
      phone: talent.phone,
      role: talent.role,
      photo: talent.photo,
      status: talent.talentStatus,
      bankName: talent.bankName,
      bankAccountName: talent.bankAccountName,
      bankAccountNumber: talent.bankAccountNumber,
      specialities,
      activeProject: activeProjectsCount,
      successProject: successProjectsCount,
      assignedRoles: assignedRoles,
    });

    return TalentResponse;
  }
}
