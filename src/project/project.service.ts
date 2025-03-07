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

@Injectable({ scope: Scope.REQUEST})
export class ProjectService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(ProjectReferences)
        private readonly projectReferencesRepository: Repository<ProjectReferences>,
        @Inject(REQUEST) private readonly request: Request,
        private readonly userService: UserService
    ) {}

    async createProject(createProjectDto: CreateProjectDto) {
        const { name, startDate, finishedDate, fee, mou, clientId } = createProjectDto;
        const client = await this.userRepository.findOne({ where: { id: clientId } });
        if (!client) throw new FailedException(`Client dengan ID ${clientId} tidak ditemukan.`, HttpStatus.NOT_FOUND, this.request.path);
        if (client.role !== Role.CLIENT) throw new FailedException(`User dengan ID ${clientId} bukan merupakan client`, HttpStatus.BAD_REQUEST, this.request.path);

        const project = this.projectRepository.create({
            projectName: name,
            startDate,
            finishedDate,
            fee,
            mou,
            client
        })
        return await this.projectRepository.save(project);
    }

    turnProjectIntoProjectResponse (project: Project) {
        const response = new ProjectResponseDto({
            id: project.id,
            startDate: project.startDate,
            finishedDate: project.finishedDate,
            fee: project.fee,
            mou: project.mou,
            client: this.userService.turnUserToUserResponse(project.client)
        });
        return response;
    }
}
