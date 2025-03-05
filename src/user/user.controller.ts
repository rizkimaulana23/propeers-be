import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
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
    async register(@Body() registerDto: RegisterDto, @Req() request: Request): Promise<BaseResponseDto<any>> {
        const userResponse = await this.userService.register(registerDto);
        return new BaseResponseDto(request, "User successfully registered", userResponse);
    }

    @Get(':email')
    @UseGuards(JwtAuthGuard)
    async getUser(@Param('email') email: string, @Req() request: Request) {
        const userResponse = await this.userService.getUser(email);
        return new BaseResponseDto(request, `User dengan email ${email} berhasil didapatkan`, userResponse);
    }
}
