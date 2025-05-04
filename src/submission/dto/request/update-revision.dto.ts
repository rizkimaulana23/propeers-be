import { IsDate, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateRevisionDto {
  @IsOptional()
  @IsString()
  revisionText?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedDeadline?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedUploadDate?: Date;
}