import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRevisionDto {
  @IsNotEmpty()
  @IsNumber()
  submissionId: number;

  @IsNotEmpty()
  @IsString()
  revisionText: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedDeadline?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedUploadDate?: Date;
}