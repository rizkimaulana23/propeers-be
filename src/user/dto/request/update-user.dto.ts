import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsOptional()
    photo: string;

    @IsString()
    description: string;

    @IsArray()
    @IsOptional()
    specialities: string[];

    @IsString()
    @IsOptional()
    bankName: string;

    @IsString()
    @IsOptional()
    bankAccountNumber: string;

    @IsString()
    @IsOptional()
    bankAccountName: string;
}