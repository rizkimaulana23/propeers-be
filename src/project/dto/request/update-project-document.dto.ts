import { IsArray, IsNotEmpty, IsOptional, IsString, IsUrl, ValidateIf, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ProjectReferencesRequestDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    @IsUrl({}, { message: 'URL tidak valid' })
    url: string;
}

export class UpdateProjectDocumentRequestDto {
    @IsOptional()
    @ValidateIf((o) => o.canvaWhiteboard !== undefined && o.canvaWhiteboard !== null && o.canvaWhiteboard !== "")
    @IsUrl({}, { message: 'URL Canva tidak valid' })
    canvaWhiteboard?: string;

    @IsOptional()
    @ValidateIf((o) => o.boardPinterest !== undefined && o.boardPinterest !== null && o.boardPinterest !== "")
    @IsUrl({}, { message: 'URL Pinterest tidak valid' })
    boardPinterest?: string;

    @IsOptional()
    bonus?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProjectReferencesRequestDto)
    references?: ProjectReferencesRequestDto[];
} 