import { Body, Controller, Delete, Get, HttpStatus, Inject, Param, Patch, Post, Put, Scope, UseGuards } from '@nestjs/common';
import { RolesDecorator } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/entities/user.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateProjectDto } from './dto/request/create-project.dto';
import { ProjectService } from './project.service';
import { AuthenticatedRequest } from 'src/common/interfaces/custom-request.interface';
import { REQUEST } from '@nestjs/core';
import { BaseResponseDto } from 'src/common/dto/success-response.dto';
import { UpdateProjectDto } from './dto/request/update-project.dto';
import { ProjectResponseDto } from './dto/response/project-response.dto';
import { filter } from 'rxjs';
import { UpdateProjectDocumentRequestDto } from './dto/request/update-project-document.dto';
import { FailedException } from 'src/common/exceptions/FailedExceptions.dto';

export enum ProjectDocument {
    CANVA = "canva",
    PINTEREST = "pinterest",
    REFERENCES = "references",
    BONUS = "bonus"
}

@Controller({ path: 'projects', scope: Scope.REQUEST})
export class ProjectController {
    constructor(
        private readonly projectService: ProjectService,
        @Inject(REQUEST) private readonly request: AuthenticatedRequest
    ) {}

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async readProject(@Param('id') id: number) {
        const response: ProjectResponseDto = await this.projectService.readProject(id);
        let filteredResponse;

        if (this.request.user?.roles !== Role.DIREKSI) {
            const { fee, ...rest } = response;
            filteredResponse = rest;
        } else {
            filteredResponse = response;
        }

        return new BaseResponseDto(this.request, "Project berhasil didapatkan", filteredResponse);

    }

    @Get('')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async readProjects() {
        const response: ProjectResponseDto[] = await this.projectService.readProjects();
        let filteredResponse: any[] = [];

        if (this.request.user?.roles !== Role.DIREKSI) {
            response.map((project) => {
                const { fee, ...rest } = project;
                filteredResponse.push(rest)
            })
        } else {
            filteredResponse = response;
        }

        return new BaseResponseDto(this.request, "Daftar project berhasil didapatkan", filteredResponse);
    }

    @Post('create-project')
    @RolesDecorator(Role.DIREKSI)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async createProject(@Body() createProjectDto: CreateProjectDto) {
        const projectResponse = await this.projectService.createProject(createProjectDto);
        return new BaseResponseDto(this.request, "Project berhasil dibuat", projectResponse);
    }

    @Put(':id')
    @RolesDecorator(Role.DIREKSI)
    @UseGuards(JwtAuthGuard,RolesGuard)
    async updateProject(@Body() updateProjectDto: UpdateProjectDto, @Param('id') id: number) {
        const projectResponse = await this.projectService.updateProject(updateProjectDto);
        return new BaseResponseDto(this.request, `Project dengan ID ${id} berhasil diperbarui`, projectResponse);
    } 

    @Delete(':id')
    @RolesDecorator(Role.DIREKSI)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async deleteProject(@Param('id') id: number) {
        return new BaseResponseDto(this.request, await this.projectService.deleteProject(id), null);
    }

    @Get('client/:email')
    @RolesDecorator(Role.DIREKSI)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getClientProjects(@Param('email') clientEmail: string) {
        const projectResponses = await this.projectService.getClientProjects(clientEmail);
        return new BaseResponseDto(
            this.request, 
            `Daftar project untuk client dengan email ${clientEmail} berhasil didapatkan`, 
            projectResponses
        );
    }

    @Patch(':id/:document')
    @RolesDecorator(Role.DIREKSI, Role.SMS)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async updateProjectDocument(
        @Param('id') projectId: number, 
        @Param('document') document: ProjectDocument,
        @Body() updateDocumentDto: UpdateProjectDocumentRequestDto
    ) {
        // Validate the document type using the enum
        if (!Object.values(ProjectDocument).includes(document)) {
            throw new FailedException(
                `Document type ${document} is not valid. Valid types are: ${Object.values(ProjectDocument).join(', ')}`,
                HttpStatus.BAD_REQUEST,
                this.request.path
            );
        }
        
        const projectResponse = await this.projectService.updateProjectDocument(projectId, updateDocumentDto, document);
        
        return new BaseResponseDto(
            this.request, 
            `Document ${document} for project ID ${projectId} successfully updated`, 
            projectResponse
        );
    }
}
