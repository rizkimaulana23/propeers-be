import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { RegisterDto } from './dto/request/register-base.dto';
import { UserService } from './user.service';
import { Role, User } from 'src/common/entities/user.entity';
import { BaseResponseDto } from 'src/common/dto/success-response.dto';
import { Request } from 'express';
import { BaseUserResponseDto } from './dto/response/user-response.dto';
import { SmsResponseDto } from './dto/response/sms-response.dto';
import { FreelancerResponseDto } from './dto/response/freelancer-response.dto';
import { RolesDecorator } from 'src/common/decorators/roles.decorator';
import { Auth } from 'src/common/decorators/auth.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {
    }

    @Post('register')
    @Public()
    async register(@Body() registerDto: RegisterDto, @Req() request: Request): Promise<BaseResponseDto<any>> {
        const user: User= await this.userService.register(registerDto);

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
            const specialities: string[] = [];
            
            for (const speciality of user.specialities) {
                specialities.push(speciality.speciality)
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

    @Get('admin-only')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Role.FREELANCER)
    async adminOnlyEndpoint() {
        return 'This is an admin-only endpoint';
    }
}
