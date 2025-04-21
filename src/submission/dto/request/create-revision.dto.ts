import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRevisionDto {
  @IsNotEmpty()
  @IsNumber()
  submissionId: number;

  @IsNotEmpty()
  @IsString()
  revisionText: string;
}