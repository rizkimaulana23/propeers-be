import { IsNumber, IsNotEmpty, IsString, isString } from 'class-validator';

export class CreateAssignedRoleDto {
    @IsNotEmpty()
    @IsNumber()
    talentId: number;

    @IsNotEmpty()
    @IsNumber()
    projectId: number;

    @IsNotEmpty()
    @IsString()
    role: string;
}