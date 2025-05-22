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
import { UploadContentDto } from './dto/request/upload-content.dto';
import { EvaluateContentDto } from './dto/request/evaluate-content.dto';
import { NotificationService } from 'src/notification/notification.service'; // Import NotificationService
import { NotificationType, RelatedEntityType } from 'src/notification/notification.enums'; // Import enums
import AssignedRoles from 'src/common/entities/assignedRoles.entity';
import { Role, User } from '@/common/entities/user.entity';
import { HistoryMetadata } from './dto/response/history-metadata.dto';

@Injectable({scope: Scope.REQUEST})
export class ContentService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        @InjectRepository(Content)
        private readonly contentRepository: Repository<Content>,
        @InjectRepository(AssignedRoles) // Inject AssignedRoles repository
        private readonly assignedRolesRepository: Repository<AssignedRoles>,
        @InjectRepository(User) // Inject AssignedRoles repository
        private readonly userRepository: Repository<User>,
        private readonly projectService: ProjectService,
        @Inject(REQUEST) private readonly request: AuthenticatedRequest,
        private readonly notificationService: NotificationService, // Inject NotificationService
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

        const savedContent = await this.contentRepository.save(newContent);

        // Notify assigned talents (Freelancers and SMS) - but only once per user
        if (project && project.id) {
            const assignments = await this.assignedRolesRepository.find({
                where: { projectId: project.id },
                relations: ['talent'],
            });

            // Track users who have already been notified to avoid duplicates
            const notifiedUserIds = new Set<number>();

            for (const assignment of assignments) {
                if (assignment.talent && 
                    (assignment.talent.role === Role.FREELANCER || assignment.talent.role === Role.SMS) &&
                    !notifiedUserIds.has(assignment.talent.id)) { // Only notify if not already notified
                    
                    // Add user to the set of notified users
                    notifiedUserIds.add(assignment.talent.id);
                    
                    await this.notificationService.createNotification({
                        userId: assignment.talent.id,
                        type: NotificationType.NEW_CONTENT_FOR_TALENT,
                        message: `New content "${savedContent.title}" has been added to project "${project.projectName}". Deadline: ${new Date(savedContent.deadline).toLocaleDateString()}.`,
                        relatedEntityId: savedContent.id,
                        relatedEntityType: RelatedEntityType.CONTENT,
                        link: `/projects/${project.id}/contents/${savedContent.id}`
                    });
                }
            }
        }

        return this.turnContentIntoContentResponseDto(savedContent);
    }

    async getListContentForProject(projectId: number) {
        const contents: Content[] = await this.contentRepository.find({
            where: {
                projectId
            },
            order: {
                createdAt: "DESC"
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

        if (content.deadline !== dto.deadline) {
            if (new Date(dto.deadline).getTime() < new Date().getTime()) throw new FailedException("Deadline should not be earlier than today", HttpStatus.BAD_REQUEST, this.request.path);
        }
        
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
            throw new FailedException(`Can't delete Content with Finished or Uploaded status.`, HttpStatus.BAD_REQUEST, this.request.url);

        const result: DeleteResult = await this.contentRepository.softDelete(content.id);

        if (result.affected && result.affected > 0) 
            return `Content dengan ID ${id} berhasil dihapus.`;

        throw new FailedException(`Content dengan ID ${id} failed to be deleted.`, HttpStatus.INTERNAL_SERVER_ERROR, this.request.path);
    }

    async uploadContent(id: number, dto: UploadContentDto) {
        const content: Content | null = await this.contentRepository.findOne({
            where: {
                id
            }
        });

        if (!content) 
            throw new FailedException(`Content with ID ${id} can't be found.`, HttpStatus.NOT_FOUND, this.request.url);

        if (content.status !== ContentStatus.FINISHED && content.status !== ContentStatus.UPLOADED)
            throw new FailedException(`Can't change Upload Link unless the Content status is Finished or Uploaded.`, HttpStatus.BAD_REQUEST, this.request.url);

        if (dto.uploadLink === "" || dto.uploadLink === null || dto.uploadLink === undefined) {
            content.status = ContentStatus.FINISHED;
            content.uploadLink = null;
            content.uploadLinkTimestamp = null;
        } else {
            content.status = ContentStatus.UPLOADED;
            content.uploadLink = dto.uploadLink;
            content.uploadLinkTimestamp = new Date();
        }

        return this.turnContentIntoContentResponseDto(await this.contentRepository.save(content));
    }

    async evaluateContent(id: number, dto: EvaluateContentDto) {
        const content: Content | null = await this.contentRepository.findOne({
            where: {
                id
            }
        });

        if (!content) 
            throw new FailedException(`Content with ID ${id} can't be found.`, HttpStatus.NOT_FOUND, this.request.url);

        if (content.status !== ContentStatus.UPLOADED)
            throw new FailedException(`Can't evaluate Content unless Content status is Uploaded.`, HttpStatus.BAD_REQUEST, this.request.url);

        content.evaluationTimestamp = dto.evaluationTimestamp;
        content.performance = dto.performanceDescription;
        content.performanceNote = dto.performanceNote;
        content.descriptiveEvaluation = dto.descriptiveEvaluation;

        return this.turnContentIntoContentResponseDto(await this.contentRepository.save(content));
    }

async getContentHistorySubmissionMetadata(contentId: number): Promise<HistoryMetadata> {
    const result = await this.contentRepository
        .createQueryBuilder('content')
        .select([
            'content.id as contentId',
            'content.title as contentName',
            'project.id as projectId',
            'project.projectName as projectName',
            'client.id as clientId',
            'client.name as clientName',
            'sms.id as smsId',
            'sms.name as smsName'
        ])
        .innerJoin('projects', 'project', 'content.projectId = project.id')
        .innerJoin('users', 'client', 'project.clientId = client.id')
        .innerJoin('assigned_roles', 'ar', 'ar.projectId = project.id AND ar.role = :smsRole')
        .innerJoin('users', 'sms', 'ar.talentId = sms.id AND sms.role = :smsUserRole')
        .where('content.id = :contentId', { contentId })
        .setParameters({
            smsRole: '-',
            smsUserRole: Role.SMS
        })
        .getRawOne();

    if (!result) {
        throw new FailedException(
            `Content with ID ${contentId} or its related data can't be found.`, 
            HttpStatus.NOT_FOUND, 
            this.request.url
        );
    }   

    return {
        clientName: result.clientname,
        clientId: result.clientid,
        contentName: result.contentname,
        contentId: result.contentid,
        projectName: result.projectname,
        projectId: result.projectid,
        smsName: result.smsname,
        smsId: result.smsid
    };
}

    turnContentIntoContentResponseDto(content: Content): ContentResponseDto {
        const projectResponse: ProjectResponseDto = this.projectService.turnProjectIntoProjectResponse(content.project);
        return new ContentResponseDto({ 
            ...content, 
            project: projectResponse
        });
    }
}
