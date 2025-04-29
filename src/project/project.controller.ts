import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Scope, UseGuards } from '@nestjs/common';
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
    // @RolesDecorator(Role.DIREKSI)
    // @UseGuards(JwtAuthGuard, RolesGuard)
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

    @Get('client/:id')
    @RolesDecorator(Role.DIREKSI)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getClientProjects(@Param('id') clientId: number) {
        const projectResponses = await this.projectService.getClientProjects(clientId);
        return new BaseResponseDto(
            this.request, 
            `Daftar project untuk client dengan ID ${clientId} berhasil didapatkan`, 
            projectResponses
        );
    }

}
