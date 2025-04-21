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

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteSubmission(@Param('id', ParseIntPipe) id: number) {
    const message = await this.submissionService.deleteSubmission(id);
    return new BaseResponseDto(this.request, message, null);
  }
}
