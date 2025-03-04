import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from 'src/common/entities/user.entity';
import { In, Repository } from 'typeorm';
import { RegisterDto } from './dto/request/register-base.dto';
import * as bcrypt from 'bcrypt'
import { Speciality } from 'src/common/entities/speciality.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Speciality)
        private readonly specialityRepository: Repository<Speciality>
    ) {}

    async register(registerDto: RegisterDto){
        const existingUser = await this.userRepository.findOne({
            where: {
                email: registerDto.email,
                deletedAt: undefined,
            }
        })
        if (existingUser) {
            throw new ConflictException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        let newUser;
        if (registerDto.role === Role.FREELANCER || registerDto.role === Role.SMS) {
            newUser = this.userRepository.create({
                email: registerDto.email,
                hashedPassword: hashedPassword,
                name: registerDto.name,
                phone: registerDto.phone,
                description: registerDto.description,
                role: registerDto.role,
                specialities:  await this.specialityRepository.findBy({ speciality: In(registerDto.specialities) })
            })
        } else {
            newUser = this.userRepository.create({
                email: registerDto.email,
                hashedPassword: hashedPassword,
                name: registerDto.name,
                phone: registerDto.phone,
                description: registerDto.description,
                role: registerDto.role,
            })
        }

        return await this.userRepository.save(newUser);
    }
}
