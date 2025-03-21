import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdatePasswordDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsOptional()
    oldPassword: string;

    @IsString()
    @IsNotEmpty()
    newPassword: string;
}