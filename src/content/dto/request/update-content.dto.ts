import { IsArray, IsDate, IsDateString, IsEnum, IsNotEmpty, IsNotEmptyObject, IsOptional, IsString, IsUrl, Matches, MinDate, ValidateIf } from "class-validator";
import { ContentPillar, JenisPostingan, TargetAudience } from "./create-content.dto";
import { ContentStatus } from "src/common/entities/content.entity";
import { NotBeforeToday } from "src/common/validator/deadline-content.validator";

export class UpdateContentPlanDto {

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsString()
    @IsOptional()
    caption: string;

    @IsDateString()
    @IsNotEmpty()
    @Matches(/^\d{4}-\d{2}-\d{2}$/)
    @NotBeforeToday({
        message: 'Deadline must not be earlier than today'
    })
    deadline: Date;

    @IsEnum(JenisPostingan)
    @IsNotEmpty()
    type: JenisPostingan;

    @IsEnum(ContentPillar)
    @IsNotEmpty()
    pillar: ContentPillar;

    @IsEnum(TargetAudience)
    @IsNotEmpty()
    targetAudience: TargetAudience;

    @ValidateIf((o) => o.uploadLink !== null && o.uploadLink !== undefined && o.uploadLink !== '')
    @IsUrl()
    uploadLink: string;

    @IsDateString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/)
    @IsOptional()
    uploadDate: Date;

    @IsArray()
    @IsUrl({}, { each: true })
    references: string[];

    @IsString()
    @IsOptional()
    performance: string;

    @IsString()
    @IsOptional()
    performanceNote: string;

    @IsDateString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/)
    @IsOptional()
    evaluationDate: Date;

    @IsString()
    @IsOptional()
    descriptiveEvaluation: string;
}