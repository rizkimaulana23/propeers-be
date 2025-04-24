export class SubmissionResponseDto {
  id: number;
  submissionCount: number;
  catatanSubmisi: string;
  submissionUrl: string;
  isVerified: boolean;
  isAcceptedByClient: boolean;
  submittedBy: string; 
  smsRevision: string;
  smsRevisionCreatedDate: Date;
  clientRevision: string;
  clientRevisionCreatedDate: Date;
  contentId: number;
  createdAt: Date;
  updatedAt: Date;
  contentDeadline: Date;
  contentUploadDate: Date;

  constructor(partial: Partial<SubmissionResponseDto>) {
    Object.assign(this, partial);
  }
}
