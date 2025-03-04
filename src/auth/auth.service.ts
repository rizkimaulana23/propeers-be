import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/common/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>) {}

    async validateUser(loginDto: LoginDto): Promise<any> {
        const user = await this.userRepository.findOne({
            where: {
                email: loginDto.email
            }
        })

        if (user && await bcrypt.compare(loginDto.password, user.hashedPassword)) {
            return user;
        } else { 
            return null;
        }
    }

    async login(user: User) {
        const payload = {
            sub: user.email,
            role: user.role
        };
        return { 
            access_token: this.jwtService.sign(payload),
        }
    }

    
}
