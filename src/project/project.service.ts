import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { Project } from 'src/common/entities/project.entity';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/request/create-project.dto';
import { ProjectReferences } from 'src/common/entities/projectReferences.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from 'src/common/entities/user.entity';
import { FailedException } from 'src/common/exceptions/FailedExceptions.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ProjectResponseDto } from './dto/response/project-response.dto';
import { BaseUserResponseDto } from 'src/user/dto/response/user-response.dto';
import { UserService } from 'src/user/user.service';
import { UpdateProjectDto } from './dto/request/update-project.dto';
import { AuthenticatedRequest } from 'src/common/interfaces/custom-request.interface';

@Injectable({ scope: Scope.REQUEST})
export class ProjectService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(ProjectReferences)
        private readonly projectReferencesRepository: Repository<ProjectReferences>,
        @Inject(REQUEST) private readonly request: AuthenticatedRequest,
        private readonly userService: UserService
    ) {}

    async readProject(id: number) {
        const project = await this.projectRepository.findOne({ where: { id }});
        if (!project) throw new FailedException(`Project dengan ID ${id} tidak ditemukan`, HttpStatus.NOT_FOUND, this.request.path);
        return this.turnProjectIntoProjectResponse(project);
    }

    async readProjects() {
        let projects;
        const userId = this.request.user?.id;

        if (this.request.user?.roles === Role.DIREKSI) {
            projects = await this.projectRepository.find();
        } else if (this.request.user?.roles === Role.CLIENT) {
            projects = await this.projectRepository.find({ where: {
                clientId: userId
            }})
        } else {
            projects = await this.projectRepository.createQueryBuilder('project')
                .innerJoin('project.assignedRoles', 'assignedRoles')
                .where('assignedRoles.talentId = :userId', { userId })
                .getMany();
        }
        
        return projects.map((project) => this.turnProjectIntoProjectResponse(project))
    }

    async createProject(createProjectDto: CreateProjectDto) {
        const { name, startDate, description, finishedDate, fee, mou, clientId } = createProjectDto;
        const client = await this.userRepository.findOne({ where: { id: clientId } });
        if (!client) throw new FailedException(`Client dengan ID ${clientId} tidak ditemukan.`, HttpStatus.NOT_FOUND, this.request.path);
        if (client.role !== Role.CLIENT) throw new FailedException(`User dengan ID ${clientId} bukan merupakan client`, HttpStatus.BAD_REQUEST, this.request.path);

        const project = this.projectRepository.create({
            projectName: name,
            startDate,
            finishedDate,
            fee,
            mou,
            client,
            description
        })
        return this.turnProjectIntoProjectResponse(await this.projectRepository.save(project));
    }

    async updateProject(updateProjectDto: UpdateProjectDto) {
        const { id, name, description, startDate, finishedDate, fee, mou, clientId } = updateProjectDto;
        const project: Project | null = await this.projectRepository.findOne({
            where: {
                id
            }
        })
        const client = await this.userRepository.findOne({ where: { id: clientId } });
        if (!client) throw new FailedException(`Client dengan ID ${clientId} tidak ditemukan.`, HttpStatus.NOT_FOUND, this.request.path);
        if (client.role !== Role.CLIENT) throw new FailedException(`User dengan ID ${clientId} bukan merupakan client`, HttpStatus.BAD_REQUEST, this.request.path);

        if (!project) {
            throw new FailedException(
                `Project dengan ID ${updateProjectDto.id} tidak ditemukan`, 
                HttpStatus.NOT_FOUND, 
                this.request.path);
        }


        project.projectName = name;
        project.startDate = startDate;
        project.finishedDate = finishedDate;
        project.fee = fee;
        project.mou = mou;
        project.description = description;
        project.client = client;

        return this.turnProjectIntoProjectResponse(await this.projectRepository.save(project));
    }

    turnProjectIntoProjectResponse (project: Project) {
        const response = new ProjectResponseDto({
            id: project.id,
            projectName: project.projectName,
            startDate: project.startDate,
            finishedDate: project.finishedDate,
            fee: project.fee,
            mou: project.mou,
            description: project.description,
            client: this.userService.turnUserToUserResponse(project.client)
        });
        return response;
    }
}
