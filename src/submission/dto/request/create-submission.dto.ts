import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSubmissionDto {
  @IsNotEmpty()
  @IsNumber()
  contentId: number;

  @IsNotEmpty()
  @IsString()
  submissionUrl: string;

  @IsString()
  catatanSubmisi: string;
}
