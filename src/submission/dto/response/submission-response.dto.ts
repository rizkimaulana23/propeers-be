export class SubmissionResponseDto {
  id: number;
  submissionCount: number;
  catatanSubmisi: string;
  submissionUrl: string;
  isVerified: boolean;
  contentId: number;
  createdAt: Date;

  constructor(partial: Partial<SubmissionResponseDto>) {
    Object.assign(this, partial);
  }
}
