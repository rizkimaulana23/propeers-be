import { IsDateString, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";

export class EvaluateContentDto {
    @IsDateString()
    @IsNotEmpty()
    @Matches(/^\d{4}-\d{2}-\d{2}$/) // YYYY-MM-DD format
    evaluationDate: Date;

    @IsString()
    @IsNotEmpty({ message: "Performance Description should not be empty"})
    performanceDescription: string;

    @IsString()
    @IsOptional()
    performanceNote: string;

    @IsString()
    @IsNotEmpty({ message: "Descriptive Evaluation should not be empty"})
    descriptiveEvaluation: string;
}