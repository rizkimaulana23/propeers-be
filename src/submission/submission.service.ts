import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository, UpdateResult } from 'typeorm';
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
import { CreateRevisionDto } from './dto/request/create-revision.dto';

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
      where: { contentId: contentId },
    });

    const isUserSMS = this.request.user?.roles === Role.SMS;

    const newSubmission = this.submissionRepository.create({
      contentId: contentId,
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

    const userRole = this.request.user?.roles;

    if (userRole === Role.FREELANCER && submission.isVerified === true) {
      throw new FailedException(
        `Freelancer tidak dapat mengubah submission yang sudah terverifikasi`,
        HttpStatus.FORBIDDEN,
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

  async deleteSubmission(id: number): Promise<string> {
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

    const result: UpdateResult = await this.submissionRepository.softDelete(id);

    if (result.affected && result.affected > 0) {
      return `Submission dengan ID ${id} berhasil dihapus.`;
    }

    throw new FailedException(
      `Submission dengan ID ${id} gagal dihapus.`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      this.request.path,
    );
  }

  async createRevision(createRevisionDto: CreateRevisionDto) {
    const { submissionId, revisionText } = createRevisionDto;

    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new FailedException(
        `Submission dengan ID ${submissionId} tidak ditemukan`,
        HttpStatus.NOT_FOUND,
        this.request.path,
      );
    }

    const userRole = this.request.user?.roles;
    const now = new Date();

    // Handle revisions based on user role
    if (userRole === Role.SMS) {
      // SMS can create revisions multiple times
      submission.smsRevision = revisionText;
      submission.smsRevisionCreatedDate = now;
    } else if (userRole === Role.CLIENT) {
      // Client can only create revision if submission is verified
      if (!submission.isVerified) {
        throw new FailedException(
          'Client hanya dapat membuat revisi pada submission yang sudah terverifikasi',
          HttpStatus.FORBIDDEN,
          this.request.path,
        );
      }

      // Check if client has already revised any submission for this contentId
      const existingClientRevisions = await this.submissionRepository.find({
        where: {
          contentId: submission.contentId,
          clientRevision: Not(IsNull()),
        },
      });

      if (existingClientRevisions.length > 0) {
        throw new FailedException(
          'Client hanya dapat membuat revisi satu kali per content',
          HttpStatus.FORBIDDEN,
          this.request.path,
        );
      }

      submission.clientRevision = revisionText;
      submission.clientRevisionCreatedDate = now;
    } else {
      throw new FailedException(
        'Hanya SMS dan Client yang dapat membuat revisi',
        HttpStatus.FORBIDDEN,
        this.request.path,
      );
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
      smsRevision: submission.smsRevision,
      smsRevisionCreatedDate: submission.smsRevisionCreatedDate,
      clientRevision: submission.clientRevision,
      clientRevisionCreatedDate: submission.clientRevisionCreatedDate,
      contentId: submission.contentId,
      createdAt: submission.createdAt,
    });
  }
}
