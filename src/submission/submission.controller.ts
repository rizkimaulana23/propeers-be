import {
  Body,
  Controller,
  Post,
  UseGuards,
  Inject,
  Scope,
} from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/request/create-submission.dto';
import { BaseResponseDto } from '../common/dto/success-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { REQUEST } from '@nestjs/core';
import { AuthenticatedRequest } from '../common/interfaces/custom-request.interface';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller({ path: 'submission', scope: Scope.REQUEST })
export class SubmissionController {
  constructor(
    private readonly submissionService: SubmissionService,
    @Inject(REQUEST) private readonly request: AuthenticatedRequest,
  ) {}

  @Post('submit')
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
}
