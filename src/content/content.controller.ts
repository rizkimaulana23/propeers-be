import { Body, Controller, Get, Inject, Param, Post, Put, UseGuards } from '@nestjs/common';
import { RolesDecorator } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/entities/user.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateContentDto } from './dto/request/create-content.dto';
import { ContentService } from './content.service';
import { BaseResponseDto } from 'src/common/dto/success-response.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UpdateContentPlanDto } from './dto/request/update-content.dto';

@Controller('contents')
export class ContentController {
    constructor(
        private readonly contentService: ContentService,
        @Inject(REQUEST) 
        private readonly request: Request
    ){}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Role.DIREKSI, Role.SMS)
    async createContent(@Body() dto: CreateContentDto)  {
        const result = await this.contentService.createContent(dto);
        return new BaseResponseDto(this.request, `Content berhasil dibuat`, result);
    }

    @Get('/projects/:projectId')
    @UseGuards(JwtAuthGuard)
    async getListContentPerProject(@Param('projectId') projectId: number) {
        const result = await this.contentService.getListContentForProject(projectId);
        return new BaseResponseDto(this.request, `Content untuk Project dengan ID ${projectId} berhasil didapatkan`, result);
    }

    @Get('/:id')
    @UseGuards(JwtAuthGuard)
    async getContentDetail(@Param('id') id: number) {
        const result = await this.contentService.getContentDetails(id);
        return new BaseResponseDto(this.request, `Content dengan ID ${id} berhasil didapatkan`, result);
    }

    @Put('/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Role.DIREKSI, Role.GM)
    async updateContent(@Param('id') id: number, @Body() updateContentPlanDto: UpdateContentPlanDto) {
        const result = await this.contentService.updateContent(id, updateContentPlanDto);
        return new BaseResponseDto(this.request, `Content dengan ID ${id} berhasil diperbarui`, result);
    }
}
