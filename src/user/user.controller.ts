import { Body, Controller, Get, HttpStatus, Inject, Param, Post, Put, Req, Scope, UseGuards } from '@nestjs/common';
import { RegisterDto } from './dto/request/register.dto';
import { UserService } from './user.service';
import { BaseResponseDto } from 'src/common/dto/success-response.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { REQUEST } from '@nestjs/core';
import { AuthenticatedRequest } from 'src/common/interfaces/custom-request.interface';
import { Role } from 'src/common/entities/user.entity';
import { FailedException } from 'src/common/exceptions/FailedExceptions.dto';
import { UpdateUserDto } from './dto/request/update-user.dto';

@Controller({ path: 'users', scope: Scope.REQUEST})
export class UserController {
    constructor(
        private readonly userService: UserService,
        @Inject(REQUEST) private readonly request: AuthenticatedRequest) {
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto): Promise<BaseResponseDto<any>> {
        const userResponse = await this.userService.register(registerDto);
        return new BaseResponseDto(this.request, "User successfully registered", userResponse);
    }

    @Get(':email')
    @UseGuards(JwtAuthGuard)
    async getUser(@Param('email') email: string) {
        console.log(this.request.user)
        const userResponse = await this.userService.getUser(email);
        return new BaseResponseDto(this.request, `User dengan email ${email} berhasil didapatkan`, userResponse);
    }

    @Put(':email')
    @UseGuards(JwtAuthGuard)
    async updateUser(@Param('email') email: string, @Body() updateUserDto: UpdateUserDto) {
        if (this.request.user?.roles !== Role.ADMIN) {
            if (email !== this.request.user?.email) throw new FailedException("Tidak dapat mengedit akun selain milik diri sendiri", HttpStatus.UNAUTHORIZED, this.request.path)
        }
        const userResponse = await this.userService.updateUser(updateUserDto);
        return new BaseResponseDto(this.request, `User dengan email ${email} berhasil diperbarui`, userResponse);
    }
}
