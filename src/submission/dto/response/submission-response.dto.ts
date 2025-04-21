export class SubmissionResponseDto {
  id: number;
  submissionCount: number;
  catatanSubmisi: string;
  submissionUrl: string;
  isVerified: boolean;
  smsRevision: string;
  smsRevisionCreatedDate: Date;
  clientRevision: string;
  clientRevisionCreatedDate: Date;
  contentId: number;
  createdAt: Date;

  constructor(partial: Partial<SubmissionResponseDto>) {
    Object.assign(this, partial);
  }
}
