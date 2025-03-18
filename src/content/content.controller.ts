import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { RolesDecorator } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/entities/user.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateContentDto } from './dto/request/create-content.dto';
import { ContentService } from './content.service';
import { BaseResponseDto } from 'src/common/dto/success-response.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

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
}
