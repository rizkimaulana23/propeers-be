import { IsNotEmpty, IsNumber, IsString, IsUrl } from 'class-validator';

export class CreateSubmissionDto {
  @IsNotEmpty()
  @IsNumber()
  contentId: number;

  @IsNotEmpty()
  @IsString()
  @IsUrl({}, { message: 'Submission URL harus berupa URL yang valid' })
  submissionUrl: string;

  @IsString()
  catatanSubmisi: string;
}
