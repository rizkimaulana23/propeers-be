import {
  Body,
  Controller,
  Post,
  UseGuards,
  Inject,
  Scope,
  Put,
  Param,
  ParseIntPipe,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/request/create-submission.dto';
import { BaseResponseDto } from '../common/dto/success-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { REQUEST } from '@nestjs/core';
import { AuthenticatedRequest } from '../common/interfaces/custom-request.interface';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UpdateSubmissionDto } from './dto/request/update-submission.dto';
import { CreateRevisionDto } from './dto/request/create-revision.dto';
import { UpdateRevisionDto } from './dto/request/update-revision.dto';
import { Role } from 'src/common/entities/user.entity';

@Controller({ path: 'submission', scope: Scope.REQUEST })
export class SubmissionController {
  constructor(
    private readonly submissionService: SubmissionService,
    @Inject(REQUEST) private readonly request: AuthenticatedRequest,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @RolesDecorator(Role.FREELANCER, Role.SMS)
  async createSubmission(@Body() createSubmissionDto: CreateSubmissionDto) {
    const submission =
      await this.submissionService.createSubmission(createSubmissionDto);
    return new BaseResponseDto(
      this.request,
      'Submission berhasil dibuat',
      submission,
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateSubmission(
    @Body() updateSubmissionDto: UpdateSubmissionDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const submission = await this.submissionService.updateSubmission(
      id,
      updateSubmissionDto,
    );

    return new BaseResponseDto(
      this.request,
      `Submission dengan ID ${id} berhasil diperbarui`,
      submission,
    );
  }

  @Post('revision')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createRevision(@Body() createRevisionDto: CreateRevisionDto) {
    const submission =
      await this.submissionService.createRevision(createRevisionDto);

    return new BaseResponseDto(
      this.request,
      'Revisi berhasil dibuat',
      submission,
    );
  }

  @Put('revision/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateRevision(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRevisionDto: UpdateRevisionDto,
  ) {
    const submission = await this.submissionService.updateRevision(
      id,
      updateRevisionDto,
    );

    return new BaseResponseDto(
      this.request,
      'Revisi berhasil diupdate',
      submission,
    );
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getListSubmissions(
    @Query('contentId', new ParseIntPipe()) contentId: number,
  ) {
    return this.submissionService.getListSubmissions(contentId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getSubmissionDetails(@Param('id', ParseIntPipe) id: number) {
    const submission = await this.submissionService.getSubmissionDetails(id);

    return new BaseResponseDto(
      this.request,
      `Submission dengan ID ${id} berhasil didapatkan`,
      submission,
    );
  }

  @Get('latest/:contentId')
  @UseGuards(JwtAuthGuard)
  async getLatestSubmissionForContent(
    @Param('contentId', ParseIntPipe) contentId: number,
  ) {
    const submission =
      await this.submissionService.getLatestSubmissionForContent(contentId);

    return new BaseResponseDto(
      this.request,
      `Submission terbaru untuk Content dengan ID ${contentId} berhasil didapatkan`,
      submission,
    );
  }

  @Put(':id/accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async acceptSubmission(@Param('id', ParseIntPipe) id: number) {
    const submission = await this.submissionService.acceptSubmission(id);

    const userRole = this.request.user?.roles;
    const message =
      userRole === Role.SMS
        ? 'Submission berhasil diverifikasi'
        : 'Submission berhasil diterima client';

    return new BaseResponseDto(this.request, message, submission);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteSubmission(@Param('id', ParseIntPipe) id: number) {
    const message = await this.submissionService.deleteSubmission(id);
    return new BaseResponseDto(this.request, message, null);
  }
}
