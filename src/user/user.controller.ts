import { Body, Controller, Post, Req } from '@nestjs/common';
import { RegisterDto } from './dto/register-base.dto';
import { UserService } from './user.service';
import { User } from 'src/common/entities/user.entity';
import { BaseResponseDto } from 'src/common/dto/success-response.dto';
import { Request } from 'express';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto, @Req() request: Request): Promise<BaseResponseDto<User>> {
        const user = await this.userService.register(registerDto);
        const response = new BaseResponseDto(request, "User successfully registered", user);
        return response;
    }
}
