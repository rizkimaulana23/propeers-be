import { Body, Controller, Inject, Post, Put, Scope, UseGuards } from '@nestjs/common';
import { RolesDecorator } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/entities/user.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateProjectDto } from './dto/request/create-project.dto';
import { ProjectService } from './project.service';
import { AuthenticatedRequest } from 'src/common/interfaces/custom-request.interface';
import { REQUEST } from '@nestjs/core';
import { BaseResponseDto } from 'src/common/dto/success-response.dto';

@Controller({ path: 'projects', scope: Scope.REQUEST})
export class ProjectController {
    constructor(
        private readonly projectService: ProjectService,
        @Inject(REQUEST) private readonly request: AuthenticatedRequest
    ) {}

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
    async updateProject() {
        
    }

}
