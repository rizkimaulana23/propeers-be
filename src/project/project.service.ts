import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { Project } from 'src/common/entities/project.entity';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/request/create-project.dto';
import { ProjectReferences } from 'src/common/entities/projectReferences.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateProjectDto } from './dto/request/update-project.dto';
import { FailedException } from 'src/common/exceptions/FailedExceptions.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { addAbortSignal } from 'stream';
import { start } from 'repl';

@Injectable({ scope: Scope.REQUEST})
export class ProjectService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        @InjectRepository(ProjectReferences)
        private readonly projectReferencesRepository: Repository<ProjectReferences>,
        @Inject(REQUEST) private readonly request: Request
    ) {}

    async createProject(createProjectDto: CreateProjectDto) {
        const { name, startDate, finishedDate, fee, mou } = createProjectDto;
        const project = this.projectRepository.create({
            projectName: name,
            startDate,
            finishedDate,
            fee,
            mou
        })
        return await this.projectRepository.save(project);
    }

    async updateProject(updateProjectDto: UpdateProjectDto) {
        const { id, name, startDate, finishedDate, fee, mou } = updateProjectDto;
        const project: Project | null = await this.projectRepository.findOne({
            where: {
                id
            }
        })

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

        return await this.projectRepository.save(project);
    }

    turnProjectIntoProjectResponse () {

    }
}
