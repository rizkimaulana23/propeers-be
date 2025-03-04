import { Body, Controller, Post, Req } from '@nestjs/common';
import { RegisterDto } from './dto/request/register-base.dto';
import { UserService } from './user.service';
import { Role, User } from 'src/common/entities/user.entity';
import { BaseResponseDto } from 'src/common/dto/success-response.dto';
import { Request } from 'express';
import { BaseUserResponseDto } from './dto/response/user-response.dto';
import { SmsResponseDto } from './dto/response/sms-response.dto';
import { FreelancerResponseDto } from './dto/response/freelancer-response.dto';
import { SpecialityResponseDto } from './dto/response/speciality-response.dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto, @Req() request: Request): Promise<BaseResponseDto<any>> {
        const user: User= await this.userService.register(registerDto);
        const response = new BaseResponseDto(request, "User successfully registered", user);

        let userResponse = new BaseUserResponseDto({
            id: user.id,
            email: user.email,
            description: user.description,
            name: user.name,
            phone: user.phone
        });

        if (user.role === Role.SMS) {
            const smsResponse: SmsResponseDto = new SmsResponseDto({
                ...userResponse,
                status: user.talentStatus,
                bankName: user.bankName,
                bankAccountName: user.bankAccountName,
                bankAccountNumber: user.bankAccountNumber
            })

            return new BaseResponseDto(request, "SMS successfully registered", smsResponse);
        } else if (user.role === Role.FREELANCER) {
            const specialities: SpecialityResponseDto[] = [];
            
            for (const speciality of user.specialities) {
                specialities.push(new SpecialityResponseDto({ speciality: speciality.name }))
            }
            
            const freelancer: FreelancerResponseDto = new FreelancerResponseDto({
                ...userResponse,
                status: user.talentStatus,
                bankName: user.bankName,
                bankAccountName: user.bankAccountName,
                bankAccountNumber: user.bankAccountNumber,
                specialities
            })

            return new BaseResponseDto(request, "FREELANCER successfully registered", freelancer);
        }
        return new BaseResponseDto(request, "User successfully registered", userResponse);
        ;
    }
}
