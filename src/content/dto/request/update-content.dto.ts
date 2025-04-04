import { IsArray, IsDate, IsDateString, IsEnum, IsNotEmpty, IsNotEmptyObject, IsOptional, IsString, IsUrl, Matches } from "class-validator";
import { ContentPillar, JenisPostingan, TargetAudience } from "./create-content.dto";

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

    @IsUrl()
    @IsOptional()
    uploadLink: string;

    @IsDateString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/)
    @IsOptional()
    uploadDate: Date;

    @IsString()
    @IsNotEmpty()
    status: string;

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