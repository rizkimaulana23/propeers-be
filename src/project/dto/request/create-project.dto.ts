import { IsDate, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Matches } from "class-validator";
import { ProjectStatus } from "src/common/entities/project.entity";

export class CreateProjectDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsDateString()
    @IsNotEmpty()
    @Matches(/^\d{4}-\d{2}-\d{2}$/) // YYYY-MM-DD format
    startDate: Date;

    @IsDateString()
    @IsNotEmpty()
    @Matches(/^\d{4}-\d{2}-\d{2}$/)
    finishedDate: Date;

    @IsNumber()
    @IsNotEmpty()
    fee: number;

    @IsUrl()
    @IsNotEmpty()
    mou: string;

    @IsNumber()
    @IsNotEmpty()
    clientId: number;
}