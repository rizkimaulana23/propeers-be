import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateSubmissionDto {
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Submission URL harus berupa URL yang valid' })
  submissionUrl?: string;

  @IsOptional()
  @IsString()
  catatanSubmisi?: string;
}