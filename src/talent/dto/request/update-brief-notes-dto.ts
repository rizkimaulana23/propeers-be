import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class UpdateBriefNotesDto {
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  briefNotesUrl: string;
}