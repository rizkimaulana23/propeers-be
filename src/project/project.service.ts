import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { Project } from 'src/common/entities/project.entity';
import { Repository, UpdateResult } from 'typeorm';
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
import { UpdateProjectDocumentRequestDto } from './dto/request/update-project-document.dto';
import { ProjectReferencesResponseDto } from './dto/response/project-references-response.dto';

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

        if (this.request.user?.roles === Role.DIREKSI || this.request.user?.roles === Role.GM) {
            projects = await this.projectRepository.find();
        } else if (this.request.user?.roles === Role.CLIENT) {
            projects = await this.projectRepository.find({ where: {
                clientId: userId
            }})
        } else {
            projects = await this.projectRepository.createQueryBuilder('project')
                .innerJoin('project.assignedRoles', 'assignedRoles')
                .leftJoinAndSelect('project.client', 'client')
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

    async deleteProject(id: number) {
        const project: Project | null = await this.projectRepository.findOne({ where: {
            id
        }});
        if (!project) throw new FailedException(`Project dengan ID ${id} tidak ada.`, HttpStatus.NOT_FOUND, this.request.path);
        const result: UpdateResult = await this.projectRepository.softDelete(project.id);
        if (result.affected && result.affected > 0) return `Project dengan ID ${id} berhasil dihapus.`;
        throw new FailedException(`Project dengan ID ${id} gagal dihapus.`, HttpStatus.INTERNAL_SERVER_ERROR, this.request.path);
    }

    turnProjectIntoProjectResponse   (project: Project) {
        const response = new ProjectResponseDto({
            id: project.id,
            projectName: project.projectName,
            startDate: project.startDate,
            finishedDate: project.finishedDate,
            fee: project.fee,
            mou: project.mou,
            description: project.description,
            boardPinterest: project.boardPinterest,
            bonus: project.bonus,
            canvaWhiteboard: project.canvaWhiteboard,
            status: project.status,
            client: this.userService.turnUserToUserResponse(project.client), 
            references: this.turnReferencesIntoReferencesDto(project.projectReferences)
        });
        return response;
    }

    turnReferencesIntoReferencesDto(references: ProjectReferences[]) {
        const result: ProjectReferencesResponseDto[] = []; 
        for (const reference of references) {
            result.push({
                id: reference.id,
                title: reference.title,
                url: reference.url
            })
        }
        return result;
    }

    async getClientProjects(clientEmail: string) {
        const client = await this.userRepository.findOne({ 
            where: { email: clientEmail }
        });
        
        if (!client) {
            throw new FailedException(
                `Client dengan email ${clientEmail} tidak ditemukan`, 
                HttpStatus.NOT_FOUND, 
                this.request.path
            );
        }
        
        if (client.role !== Role.CLIENT) {
            throw new FailedException(
                `User dengan email ${clientEmail} bukan merupakan client`, 
                HttpStatus.BAD_REQUEST, 
                this.request.path
            );
        }
        
        const projects = await this.projectRepository.find({ 
            where: { clientId: client.id }
        });
        
        return projects.map(project => this.turnProjectIntoProjectResponse(project));
    }

    async updateProjectDocument(projectId: number, dto: UpdateProjectDocumentRequestDto, documentType: string) {
        const project = await this.projectRepository.findOne({
            where: {
                id: projectId
            }
        });

        if (!project) 
            throw new FailedException(`Project with ID ${projectId} was not found.`, HttpStatus.NOT_FOUND, this.request.path);

        switch (documentType) {
            case 'canva':
                project.canvaWhiteboard = dto.canvaWhiteboard ?? '';
                break;
            case 'pinterest':
                project.boardPinterest = dto.boardPinterest ?? '';
                break;
            case 'bonus':
                project.bonus = dto.bonus ?? '';
                break;
            case 'references':
                await this.projectReferencesRepository.delete({ projectId: projectId });
                
                // Then add the new references
                if (dto.references) {
                    for (const reference of dto.references) {
                        const newReference = this.projectReferencesRepository.create({
                            projectId: project.id,
                            title: reference.title,
                            url: reference.url
                        });
                        await this.projectReferencesRepository.save(newReference);
                    }
                }
                return this.turnProjectIntoProjectResponse(project);
            default:
                throw new FailedException(
                    `Document type ${documentType} is not supported.`, 
                    HttpStatus.BAD_REQUEST, 
                    this.request.path
                );
        }

        await this.projectRepository.save(project);
        return this.turnProjectIntoProjectResponse(project);
    }
}
