import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository, UpdateResult } from 'typeorm';
import { Submission } from '../common/entities/submission.entity';
import { Content, ContentStatus } from '../common/entities/content.entity';
import { CreateSubmissionDto } from './dto/request/create-submission.dto';
import { SubmissionResponseDto } from './dto/response/submission-response.dto';
import { FailedException } from '../common/exceptions/FailedExceptions.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { AuthenticatedRequest } from 'src/common/interfaces/custom-request.interface';
import { Role, User } from 'src/common/entities/user.entity';
import { UpdateSubmissionDto } from './dto/request/update-submission.dto';
import { CreateRevisionDto } from './dto/request/create-revision.dto';
import { UpdateRevisionDto } from './dto/request/update-revision.dto';
import { NotificationService } from 'src/notification/notification.service'; // Import NotificationService
import { NotificationType, RelatedEntityType } from 'src/notification/notification.enums'; // Import enums
import AssignedRoles from 'src/common/entities/assignedRoles.entity'; // Import AssignedRoles
import { Project } from 'src/common/entities/project.entity'; // Import Project

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AssignedRoles) // To find SMS for the project
    private readonly assignedRolesRepository: Repository<AssignedRoles>,
    @InjectRepository(Project) // To get client from project
    private readonly projectRepository: Repository<Project>,
    @Inject(REQUEST) private readonly request: AuthenticatedRequest,
    private readonly notificationService: NotificationService, // Inject NotificationService
  ) { }

  async createSubmission(createSubmissionDto: CreateSubmissionDto) {
    console.log("Masuk Create Submission")
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
    const submittedBy = this.request.user?.email || 'Unknown User';

    const submissionDate = new Date();
    const deadlineDate = new Date(content.deadline);
    const timeDiff = deadlineDate.getTime() - submissionDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    let durasiLate: number | null = null;
    let durasiOnTime: number | null = null;

    if (daysDiff < 0) {
      durasiLate = Math.abs(daysDiff);
    } else {
      durasiOnTime = daysDiff;
    }

    const newSubmission = this.submissionRepository.create({
      contentId: contentId,
      submissionUrl,
      catatanSubmisi,
      submissionCount: submissionCount + 1,
      isVerified: isUserSMS,
      submittedBy: submittedBy,
    });

    if (durasiLate !== null) {
      newSubmission.durasiLate = durasiLate;
    }
    if (durasiOnTime !== null) {
      newSubmission.durasiOnTime = durasiOnTime;
    }

    const savedSubmission = await this.submissionRepository.save(newSubmission);

    const submitter = await this.userRepository.findOne({ where: { email: savedSubmission.submittedBy } });

    if (submitter && submitter.role === Role.FREELANCER && content && content.projectId) {
      // Find all assignments for this project
      const projectAssignments = await this.assignedRolesRepository.find({
        where: { projectId: content.projectId },
        relations: ['talent'],
      });

      for (const assignment of projectAssignments) {
        if (assignment.talentId) { // Check if talentId exists
          // Fetch the user details for this talentId
          const assignedUser = await this.userRepository.findOne({
            where: { id: assignment.talentId }
          });

          // Check if the assigned user is an SMS
          if (assignedUser && assignedUser.role === Role.SMS) {
            try {
              await this.notificationService.createNotification({
                userId: assignedUser.id, // Notify the SMS user
                type: NotificationType.NEW_SUBMISSION_FOR_SMS,
                message: `Freelancer ${submitter.name || 'N/A'} submitted work for content "${content.title || 'N/A'}" in project (ID: ${content.projectId}).`,
                relatedEntityId: savedSubmission.id,
                relatedEntityType: RelatedEntityType.SUBMISSION,
                link: `/projects/${content.projectId}/contents/${content.id}`
              });
            } catch (error) {
              console.error(`Failed to create notification for SMS user ID: ${assignedUser.id}`, error);
            }
          }
        }
      }
    }

    return this.turnSubmissionToSubmissionResponse(savedSubmission, content);
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

    const content = await this.contentRepository.findOne({
      where: { id: submission.contentId },
    });

    if (!content) {
      throw new FailedException(
        `Content dengan ID ${submission.contentId} tidak ditemukan`,
        HttpStatus.NOT_FOUND,
        this.request.path,
      );
    }

    const userRole = this.request.user?.roles;
    const userEmail = this.request.user?.email;

    // Cek apakah user adalah pembuat submission
    if (submission.submittedBy !== userEmail) {
      throw new FailedException(
        `Anda tidak memiliki izin untuk mengubah submission ini`,
        HttpStatus.FORBIDDEN,
        this.request.path,
      );
    }

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

    const submissionDate = new Date();
    const deadlineDate = new Date(content.deadline);
    const timeDiff = deadlineDate.getTime() - submissionDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Update durasiLate atau durasiOnTime berdasarkan perbandingan tanggal
    if (daysDiff < 0) {
      // Submission telat (setelah deadline)
      submission.durasiLate = Math.abs(daysDiff);
      submission.durasiOnTime = null;
    } else {
      // Submission tepat waktu (sebelum atau tepat pada deadline)
      submission.durasiOnTime = daysDiff;
      submission.durasiLate = null;
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

    const userRole = this.request.user?.roles;
    const userEmail = this.request.user?.email;

    // Cek apakah user adalah pembuat submission
    if (submission.submittedBy !== userEmail) {
      throw new FailedException(
        `Anda tidak memiliki izin untuk menghapus submission ini`,
        HttpStatus.FORBIDDEN,
        this.request.path,
      );
    }

    if (userRole === Role.FREELANCER && submission.isVerified === true) {
      throw new FailedException(
        `Freelancer tidak dapat menghapus submission yang sudah terverifikasi`,
        HttpStatus.FORBIDDEN,
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
    const { submissionId, revisionText, updatedDeadline, updatedUploadDate } =
      createRevisionDto;

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

    const content = await this.contentRepository.findOne({
      where: { id: submission.contentId },
    });

    if (!content) {
      throw new FailedException(
        `Content dengan ID ${submission.contentId} tidak ditemukan`,
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

      // Update related content if dates are provided
      if (updatedDeadline || updatedUploadDate) {
        if (updatedDeadline) {
          content.deadline = updatedDeadline;
        }

        if (updatedUploadDate) {
          content.uploadDate = updatedUploadDate;
        }

        // Validate that uploadDate is not before deadline
        if (content.uploadDate < content.deadline) {
          throw new FailedException(
            'Upload date tidak boleh lebih awal dari deadline',
            HttpStatus.BAD_REQUEST,
            this.request.path,
          );
        }

        await this.contentRepository.save(content);
      }
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

      // Update related content if dates are provided
      if (updatedDeadline || updatedUploadDate) {
        if (updatedDeadline) {
          content.deadline = updatedDeadline;
        }

        if (updatedUploadDate) {
          content.uploadDate = updatedUploadDate;
        }

        // Validate that uploadDate is not before deadline
        if (content.uploadDate < content.deadline) {
          throw new FailedException(
            'Upload date tidak boleh lebih awal dari deadline',
            HttpStatus.BAD_REQUEST,
            this.request.path,
          );
        }

        await this.contentRepository.save(content);
      }
    }

    const updatedSubmission = await this.submissionRepository.save(submission);
    return this.turnSubmissionToSubmissionResponse(updatedSubmission, content);
  }

  async updateRevision(id: number, updateRevisionDto: UpdateRevisionDto) {
    // Find submission by ID
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

    // Find related content
    const content = await this.contentRepository.findOne({
      where: { id: submission.contentId },
    });

    if (!content) {
      throw new FailedException(
        `Content dengan ID ${submission.contentId} tidak ditemukan`,
        HttpStatus.NOT_FOUND,
        this.request.path,
      );
    }

    const userRole = this.request.user?.roles;
    const { revisionText, updatedDeadline, updatedUploadDate } =
      updateRevisionDto;
    const now = new Date();

    // Handle update based on user role
    if (userRole === Role.SMS) {
      // SMS can update revision anytime
      if (revisionText) {
        submission.smsRevision = revisionText;
        submission.smsRevisionCreatedDate = now;
      }
    } else if (userRole === Role.CLIENT) {
      // Client can only update if submission is verified
      if (!submission.isVerified) {
        throw new FailedException(
          'Client hanya dapat mengubah revisi pada submission yang sudah terverifikasi',
          HttpStatus.FORBIDDEN,
          this.request.path,
        );
      }

      // Client must have already created a revision
      if (!submission.clientRevision) {
        throw new FailedException(
          'Client hanya dapat mengubah revisi yang sudah dibuat sebelumnya',
          HttpStatus.FORBIDDEN,
          this.request.path,
        );
      }

      if (revisionText) {
        submission.clientRevision = revisionText;
        submission.clientRevisionCreatedDate = now;
      }
    }

    // Update content dates if provided
    if (updatedDeadline || updatedUploadDate) {
      if (updatedDeadline) {
        content.deadline = updatedDeadline;
      }

      if (updatedUploadDate) {
        content.uploadDate = updatedUploadDate;
      }

      // Validate dates
      if (content.uploadDate < content.deadline) {
        throw new FailedException(
          'Upload date tidak boleh lebih awal dari deadline',
          HttpStatus.BAD_REQUEST,
          this.request.path,
        );
      }

      await this.contentRepository.save(content);
    }

    const updatedSubmission = await this.submissionRepository.save(submission);
    return this.turnSubmissionToSubmissionResponse(updatedSubmission, content);
  }

  async getListSubmissions(contentId: number) {
    // Validate content exists
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

    // Get user role for permission check
    const userRole = this.request.user?.roles;

    // Build query to find submissions
    const queryBuilder = this.submissionRepository
      .createQueryBuilder('submission')
      .where('submission.contentId = :contentId', { contentId })
      .orderBy('submission.submissionCount', 'DESC'); // Newest submissions first

    // Client can only see verified submissions
    if (userRole === Role.CLIENT) {
      queryBuilder.andWhere('submission.isVerified = :isVerified', {
        isVerified: true,
      });
    }

    // Get all submissions (including soft-deleted ones if needed)
    const submissions = await queryBuilder.getMany();

    // Transform to response DTOs and include content details
    return submissions.map((submission) =>
      this.turnSubmissionToSubmissionResponse(submission, content),
    );
  }

  async getSubmissionDetails(id: number) {
    // Find submission by ID
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

    // Get user role
    const userRole = this.request.user?.roles;

    // Client cannot view unverified submissions
    if (userRole === Role.CLIENT && !submission.isVerified) {
      throw new FailedException(
        `Client tidak dapat melihat submission yang belum terverifikasi`,
        HttpStatus.FORBIDDEN,
        this.request.path,
      );
    }

    // Find related content
    const content = await this.contentRepository.findOne({
      where: { id: submission.contentId },
    });

    if (!content) {
      throw new FailedException(
        `Content dengan ID ${submission.contentId} tidak ditemukan`,
        HttpStatus.NOT_FOUND,
        this.request.path,
      );
    }

    // Return submission with content details
    return this.turnSubmissionToSubmissionResponse(submission, content);
  }

  async getLatestSubmissionForContent(contentId: number) {
    const userRole = this.request.user?.roles;

    // Base query to find submission for the content
    const queryBuilder = this.submissionRepository
      .createQueryBuilder('submission')
      .where('submission.contentId = :contentId', { contentId })
      .orderBy('submission.createdAt', 'DESC'); // Order by newest first

    // If client, only show verified submissions
    if (userRole === Role.CLIENT) {
      queryBuilder.andWhere('submission.isVerified = :isVerified', {
        isVerified: true,
      });
    }

    // Get the latest submission
    const submission = await queryBuilder.getOne();

    if (!submission) {
      throw new FailedException(
        `Tidak ditemukan submission untuk Content dengan ID ${contentId}`,
        HttpStatus.NOT_FOUND,
        this.request.path,
      );
    }

    // Get related content
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

    // Return submission with content details
    return this.turnSubmissionToSubmissionResponse(submission, content);
  }

  async acceptSubmission(id: number) {
    // Find submission by ID
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

    // Get user role
    const userRole = this.request.user?.roles;
    let wasVerifiedBySms = false;

    // Handle acceptance based on user role
    if (userRole === Role.SMS) {
      // SMS sets isVerified to true
      if (!submission.isVerified) { // Check if it's a new verification
        submission.isVerified = true;
        wasVerifiedBySms = true;
      }
    } else if (userRole === Role.CLIENT) {
      // Client can only accept if submission is verified
      if (!submission.isVerified) {
        throw new FailedException(
          'Client hanya dapat menerima submission yang sudah terverifikasi',
          HttpStatus.BAD_REQUEST,
          this.request.path,
        );
      }

      // Client sets isAcceptedByClient to true
      submission.isAcceptedByClient = true;

      const content: Content | null = await this.contentRepository.findOne({
        where: {
          id: submission.contentId,
        },
      });
      if (content) {
        content.status = ContentStatus.FINISHED;
        await this.contentRepository.save(content);
      }
    }

    const updatedSubmission = await this.submissionRepository.save(submission);

    // Find related content
    const content = await this.contentRepository.findOne({
      where: { id: submission.contentId },
    });

    if (!content) {
      throw new FailedException(
        `Content dengan ID ${submission.contentId} tidak ditemukan`,
        HttpStatus.NOT_FOUND,
        this.request.path,
      );
    }

    // Notify Client if SMS verified the submission
    if (wasVerifiedBySms && content.project && content.project.clientId) {
      await this.notificationService.createNotification({
        userId: content.project.clientId,
        type: NotificationType.CONTENT_VERIFIED_FOR_CLIENT,
        message: `Content "${content.title}" for project "${content.project.projectName}" has been reviewed by SMS and is ready for your approval.`,
        relatedEntityId: submission.id, // or content.id
        relatedEntityType: RelatedEntityType.SUBMISSION, // or RelatedEntityType.CONTENT
        link: `/projects/${content.projectId}/contents/${content.id}` // Example link
      });
    }

    return this.turnSubmissionToSubmissionResponse(updatedSubmission, content);
  }

  turnSubmissionToSubmissionResponse(
    submission: Submission,
    content?: Content,
  ) {
    if (!submission) return undefined;

    return new SubmissionResponseDto({
      id: submission.id,
      submissionCount: submission.submissionCount,
      catatanSubmisi: submission.catatanSubmisi,
      submissionUrl: submission.submissionUrl,
      isVerified: submission.isVerified,
      isAcceptedByClient: submission.isAcceptedByClient,
      submittedBy: submission.submittedBy,
      smsRevision: submission.smsRevision,
      smsRevisionCreatedDate: submission.smsRevisionCreatedDate,
      clientRevision: submission.clientRevision,
      clientRevisionCreatedDate: submission.clientRevisionCreatedDate,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
      contentId: submission.contentId,
      contentDeadline: content?.deadline,
      contentUploadDate: content?.uploadDate,
      durasiLate: submission.durasiLate,
      durasiOnTime: submission.durasiOnTime,
    });
  }
}
