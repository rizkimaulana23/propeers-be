import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Role } from "src/common/entities/user.entity";

export class RegisterDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    description: string;

    @IsArray()
    specialities: string[];

    @IsEnum(Role)
    @IsNotEmpty()
    role: Role;
}