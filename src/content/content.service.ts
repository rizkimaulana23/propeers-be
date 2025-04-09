import { BadRequestException, HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { CreateContentDto } from './dto/request/create-content.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/common/entities/project.entity';
import { DeleteResult, Repository } from 'typeorm';
import { Content, ContentStatus } from 'src/common/entities/content.entity';
import { FailedException } from 'src/common/exceptions/FailedExceptions.dto';
import { ContentResponseDto } from './dto/response/content.dto';
import { ProjectService } from 'src/project/project.service';
import { ProjectResponseDto } from 'src/project/dto/response/project-response.dto';
import { UpdateContentPlanDto } from './dto/request/update-content.dto';
import { AuthenticatedRequest } from 'src/common/interfaces/custom-request.interface';

@Injectable({scope: Scope.REQUEST})
export class ContentService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        @InjectRepository(Content)
        private readonly contentRepository: Repository<Content>,
        private readonly projectService: ProjectService,
        @Inject(REQUEST) private readonly request: AuthenticatedRequest,
    ) {}

    async createContent(dto: CreateContentDto) {
        const project: Project | null = await this.projectRepository.findOne({ where: { id: dto.projectId }});
        if (!project) 
            throw new FailedException(`Project dengan ID ${dto.projectId} tidak ditemukan`, HttpStatus.NOT_FOUND, this.request.url);

        if (dto.uploadDate < dto.deadline) 
            throw new FailedException(`Deadline should be earlier or the same as Upload Date.`, HttpStatus.BAD_REQUEST, this.request.url);

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

    async updateContent(id: number, dto: UpdateContentPlanDto) {
        const content: Content | null = await this.contentRepository.findOne({ 
            where: {
                id
            }
        })
        if (!content) 
            throw new FailedException(`Content dengan ID ${id} can't be found`, HttpStatus.NOT_FOUND, this.request.url);

        if (dto.uploadDate < dto.deadline) 
            throw new FailedException(`Deadline should be earlier or the same as Upload Date.`, HttpStatus.BAD_REQUEST, this.request.url);

        if (content.status === ContentStatus.FINISHED && (dto.uploadLink !== null || dto.uploadLink !== undefined || dto.uploadLink !== ''))
            this.contentRepository.update({ id }, { status: ContentStatus.UPLOADED});
        
        const result = await this.contentRepository.update({ id }, { ...dto });
        
        const updatedContent: Content | null = await this.contentRepository.findOne({ 
            where: {
                id
            }
        })
        if (!updatedContent) {
            throw new FailedException(`Failed to update content with ID ${id}`, HttpStatus.INTERNAL_SERVER_ERROR, this.request.url);
        }
        return this.turnContentIntoContentResponseDto(updatedContent);
    }

    async deleteContent(id: number) {
        const content: Content | null = await this.contentRepository.findOne({
            where: {
                id
            }
        });

        if (!content) 
            throw new FailedException(`Content with ID ${id} can't be found.`, HttpStatus.NOT_FOUND, this.request.url);

        if (content.status === ContentStatus.FINISHED || content.status === ContentStatus.UPLOADED)
            throw new FailedException(`Can't delete Content with  Finished or Uploaded status.`, HttpStatus.BAD_REQUEST, this.request.url);

        const result: DeleteResult = await this.contentRepository.softDelete(content.id);

        if (result.affected && result.affected > 0) 
            return `Content dengan ID ${id} berhasil dihapus.`;

        throw new FailedException(`Content dengan ID ${id} failed to be deleted.`, HttpStatus.INTERNAL_SERVER_ERROR, this.request.path);
    }

    turnContentIntoContentResponseDto(content: Content): ContentResponseDto {
        const projectResponse: ProjectResponseDto = this.projectService.turnProjectIntoProjectResponse(content.project);
        return new ContentResponseDto({ 
            ...content, 
            project: projectResponse
        });
    }
}
