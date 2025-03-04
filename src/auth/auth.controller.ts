import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly  authService: AuthService
    ) {}

    @Post('login')
    async login(@Body() LoginDto: LoginDto) {
        const user = await this.authService.validateUser(LoginDto);
        if (!user) {
            throw new UnauthorizedException();
        }
        return this.authService.login(user);
    }
}
