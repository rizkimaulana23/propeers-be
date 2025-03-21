import { Body, Controller, HttpStatus, Post, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { FailedException } from 'src/common/exceptions/FailedExceptions.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly  authService: AuthService,

    ) {}

    @Public()
    @Post('login')
    async login(@Body() LoginDto: LoginDto, @Req() request: Request) {
        const user = await this.authService.validateUser(LoginDto);
        if (!user) {
            throw new FailedException("Email atau password salah!", HttpStatus.BAD_REQUEST, request.path);
        }
        return this.authService.login(user);
    }
}
