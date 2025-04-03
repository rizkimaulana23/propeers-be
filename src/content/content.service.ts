import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { CreateContentDto } from './dto/request/create-content.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/common/entities/project.entity';
import { Repository } from 'typeorm';
import { Content } from 'src/common/entities/content.entity';
import { FailedException } from 'src/common/exceptions/FailedExceptions.dto';
import { ContentResponseDto } from './dto/response/content.dto';
import { ProjectService } from 'src/project/project.service';
import { ProjectResponseDto } from 'src/project/dto/response/project-response.dto';

@Injectable({scope: Scope.REQUEST})
export class ContentService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        @InjectRepository(Content)
        private readonly contentRepository: Repository<Content>,
        private readonly projectService: ProjectService,
        @Inject(REQUEST) private readonly request: Request,
    ) {}

    async createContent(dto: CreateContentDto) {
        const project: Project | null = await this.projectRepository.findOne({ where: { id: dto.projectId }});
        if (!project) 
            throw new FailedException(`Project dengan ID ${dto.projectId} tidak ditemukan`, HttpStatus.NOT_FOUND, this.request.url);

        const newContent = this.contentRepository.create({
            title: dto.title,
            description: dto.description,
            caption: dto.caption,
            targetAudience: dto.targetAudience,
            deadline: dto.deadline,
            type: dto.type,
            pillar: dto.pillar,
            uploadDate: dto.uploadDate,
            project: project
        })

        return this.turnContentIntoContentResponseDto(await this.contentRepository.save(newContent));
    }

    async getListContentForProject(projectId: number) {
        const contents: Content[] = await this.contentRepository.find({
            where: {
                projectId
            }
        })

        const contentResponses: ContentResponseDto[] = contents.map((content) => 
            this.turnContentIntoContentResponseDto(content)
        )

        return contentResponses;
    }

    async getContentDetails(id: number) {
        const content: Content | null = await this.contentRepository.findOne({
            where: {
                id
            }
        })
        if (!content) 
            throw new FailedException(`Content dengan ID ${id} tidak ditemukan`, HttpStatus.NOT_FOUND, this.request.url);


        return this.turnContentIntoContentResponseDto(content)
    }

    turnContentIntoContentResponseDto(content: Content): ContentResponseDto {
        const projectResponse: ProjectResponseDto = this.projectService.turnProjectIntoProjectResponse(content.project);
        return new ContentResponseDto({ 
            ...content, 
            project: projectResponse
        });
    }
}
