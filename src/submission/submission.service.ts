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

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async createSubmission(createSubmissionDto: CreateSubmissionDto) {
    const { contentId, submissionUrl, catatanSubmisi } = createSubmissionDto;

    // Find the content
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

    // Get the current submission count for this content
    const submissionCount = await this.submissionRepository.count({
      where: { contentId: contentId.toString() },
    });

    // Create new submission
    const newSubmission = this.submissionRepository.create({
      contentId: contentId.toString(),
      submissionUrl,
      catatanSubmisi,
      submissionCount: submissionCount + 1, // Increment submission count
      isVerified: false, // Default is unverified
    });

    const savedSubmission = await this.submissionRepository.save(newSubmission);

    return this.turnSubmissionToSubmissionResponse(savedSubmission);
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
