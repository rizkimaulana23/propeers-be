import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from '../common/entities/submission.entity';
import { Content } from '../common/entities/content.entity';
import { CreateSubmissionDto } from './dto/request/create-submission.dto';
import { SubmissionResponseDto } from './dto/response/submission-response.dto';
import { FailedException } from '../common/exceptions/FailedExceptions.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { AuthenticatedRequest } from 'src/common/interfaces/custom-request.interface';
import { Role } from 'src/common/entities/user.entity';
import { UpdateSubmissionDto } from './dto/request/update-submission.dto';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @Inject(REQUEST) private readonly request: AuthenticatedRequest,
  ) {}

  async createSubmission(createSubmissionDto: CreateSubmissionDto) {
    const { contentId, submissionUrl, catatanSubmisi } = createSubmissionDto;

    const content = await this.contentRepository.findOne({
      where: { id: contentId },
    });

    if (!content) {
      throw new FailedException(
        `Content dengan ID ${contentId} tidak ditemukan`,
        HttpStatus.NOT_FOUND,
        this.request.path,
      );
    }

    const submissionCount = await this.submissionRepository.count({
      where: { contentId: contentId.toString() },
    });

    const isUserSMS = this.request.user?.roles === Role.SMS;
    console.log('User roles:', this.request.user?.roles);

    const newSubmission = this.submissionRepository.create({
      contentId: contentId.toString(),
      submissionUrl,
      catatanSubmisi,
      submissionCount: submissionCount + 1,
      isVerified: isUserSMS,
    });

    const savedSubmission = await this.submissionRepository.save(newSubmission);

    return this.turnSubmissionToSubmissionResponse(savedSubmission);
  }

  async updateSubmission(id: number, updateSubmissionDto: UpdateSubmissionDto) {
    const submission = await this.submissionRepository.findOne({
      where: { id },
    });

    if (!submission) {
      throw new FailedException(
        `Submission dengan ID ${id} tidak ditemukan`,
        HttpStatus.NOT_FOUND,
        this.request.path,
      );
    }

    const { submissionUrl, catatanSubmisi } = updateSubmissionDto;

    if (submissionUrl !== undefined) {
      submission.submissionUrl = submissionUrl;
    }

    if (catatanSubmisi !== undefined) {
      submission.catatanSubmisi = catatanSubmisi;
    }

    const updatedSubmission = await this.submissionRepository.save(submission);

    return this.turnSubmissionToSubmissionResponse(updatedSubmission);
  }

  turnSubmissionToSubmissionResponse(submission: Submission) {
    if (!submission) return undefined;

    return new SubmissionResponseDto({
      id: submission.id,
      submissionCount: submission.submissionCount,
      catatanSubmisi: submission.catatanSubmisi,
      submissionUrl: submission.submissionUrl,
      isVerified: submission.isVerified,
      contentId: parseInt(submission.contentId),
      createdAt: submission.createdAt,
    });
  }
}
