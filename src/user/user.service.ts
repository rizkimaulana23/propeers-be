import { ConflictException, HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from 'src/common/entities/user.entity';
import { In, Repository } from 'typeorm';
import { RegisterDto } from './dto/request/register.dto';
import * as bcrypt from 'bcrypt'
import { Speciality } from 'src/common/entities/speciality.entity';
import { REQUEST } from '@nestjs/core';
import { FailedException } from 'src/common/exceptions/FailedExceptions.dto';
import { Request } from 'express';
import { SmsResponseDto } from './dto/response/sms-response.dto';
import { BaseUserResponseDto } from './dto/response/user-response.dto';
import { FreelancerResponseDto } from './dto/response/freelancer-response.dto';
import { UpdateUserDto } from './dto/request/update-user.dto';
import { UpdatePasswordDto } from './dto/request/update-password.dto';
import { AuthenticatedRequest } from 'src/common/interfaces/custom-request.interface';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Speciality)
        private readonly specialityRepository: Repository<Speciality>,
        @Inject(REQUEST) private readonly request: AuthenticatedRequest
    ) {}

    async register(registerDto: RegisterDto){
        const existingUser = await this.userRepository.findOne({
            where: {
                email: registerDto.email,
                deletedAt: undefined,
            },
            relations: ['specialities']
        })
        if (existingUser) {
            throw new FailedException("User already registered", HttpStatus.CONFLICT, this.request.path);
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

        return this.turnUserToUserResponse(await this.userRepository.save(newUser));
    }

    async getUser(email: string) {
        const user: User | null = await this.userRepository.findOne({
            where: {
                email,
            },
            relations: ['projects'] 
        })
        if (!user) throw new FailedException(`User dengan email ${email} tidak ditemukan`, HttpStatus.NOT_FOUND, this.request.path);
        return this.turnUserToUserResponse(user);
    }
    
    async updateUser(updateUserDto: UpdateUserDto) {

        const user: User | null = await this.userRepository.findOne({
            where: {
                id: updateUserDto.id
            }
        })
        
        if (!user) {
            throw new FailedException("User not found", HttpStatus.NOT_FOUND, this.request.path);
        }

        user.name = updateUserDto.name;
        user.email = updateUserDto.email;
        user.description = updateUserDto.description;
        user.photo = updateUserDto.photo;
        if (user.role === Role.FREELANCER) {
            user.bankName = updateUserDto.bankName;
            user.bankAccountName = updateUserDto.bankAccountName;
            user.bankAccountNumber = updateUserDto.bankAccountNumber;
            user.specialities = await this.specialityRepository.findBy({ speciality: In(updateUserDto.specialities) })
        }
        if (user.role === Role.SMS) {
            user.bankName = updateUserDto.bankName;
            user.bankAccountName = updateUserDto.bankAccountName;
            user.bankAccountNumber = updateUserDto.bankAccountNumber;
        }
        return this.turnUserToUserResponse(await this.userRepository.save(user));
    }

    async updatePassword(updatePasswordDto: UpdatePasswordDto) {
        const user = await this.userRepository.findOne({
            where: { email: updatePasswordDto.email }
        })
        if (!user) throw new FailedException(
            `User dengan email ${updatePasswordDto.email} tidak ditemukan`,
            HttpStatus.NOT_FOUND,
            this.request.path
        )

        const isAdmin = this.request.user?.roles === Role.ADMIN;
    
        if (!isAdmin) {
            if (!updatePasswordDto.oldPassword) {
                throw new FailedException(
                    "Harap Masukkan Password Lama", 
                    HttpStatus.BAD_REQUEST, 
                    this.request.path
                );
            }
            
            const isPasswordMatching = await bcrypt.compare(
                updatePasswordDto.oldPassword, 
                user.hashedPassword
            );
            
            if (!isPasswordMatching) {
                throw new FailedException(
                    "Password lama tidak cocok",
                    HttpStatus.BAD_REQUEST,
                    this.request.path
                );
            }
        }
        
        user.hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);
        return this.turnUserToUserResponse(await this.userRepository.save(user));
    }

    async getUsers(roles?: Role[], includeDeleted: boolean = false) {
        let users;
        const whereCondition: any = includeDeleted ? {} : { deletedAt: undefined };
    
        if (roles && roles.length > 0) {
            whereCondition.role = In(roles);
            
            const relations = roles.includes(Role.CLIENT) ? ['projects'] : [];
            users = await this.userRepository.find({ 
                where: whereCondition,
                relations
            });
        } else {
            users = await this.userRepository.find({ 
                where: whereCondition,
                relations: ['projects'] // Load projects for all users
            });
        }
        
        return users.map(user => this.turnUserToUserResponse(user));
    }

    async deleteUser(email: string) {
        const user = await this.userRepository.findOne({
            where: {
                email
            }
        })

        if (!user) {
            throw new FailedException("User tidak ditemukan", HttpStatus.NOT_FOUND, this.request.path);
        }        
        
        return await this.userRepository.softDelete({ email });
    }

    turnUserToUserResponse(user: User) {
        if (!user) return undefined;
        let userResponse = new BaseUserResponseDto({
            id: user.id,
            email: user.email,
            description: user.description,
            name: user.name,
            phone: user.phone,
            role: user.role,
            photo: user.photo
        });

        if (user.role === Role.SMS) {
            const smsResponse: SmsResponseDto = new SmsResponseDto({
                ...userResponse,
                status: user.talentStatus,
                bankName: user.bankName,
                bankAccountName: user.bankAccountName,
                bankAccountNumber: user.bankAccountNumber,
                specialities: user.specialities.map((s) => s.speciality)
            })

            return smsResponse;
        } else if (user.role === Role.FREELANCER) {
            const specialities: string[] = [];
            if (user.specialities) {
                for (const speciality of user.specialities) {
                    specialities.push(speciality.speciality)
                }
            }
            
            
            const freelancerResponse: FreelancerResponseDto = new FreelancerResponseDto({
                ...userResponse,
                status: user.talentStatus,
                bankName: user.bankName,
                bankAccountName: user.bankAccountName,
                bankAccountNumber: user.bankAccountNumber,
                specialities
            }) 

            return freelancerResponse;

            
        } else if (user.role === Role.CLIENT) {
            const activeProjects = user.projects ? 
                user.projects.filter(project => 
                    project.status === 'CREATED' || project.status === 'ONGOING'
                ).length : 0;
            
            const successProjects = user.projects ? 
                user.projects.filter(project => 
                    project.status === 'FINISHED'
                ).length : 0;
                
            return {
                ...userResponse,
                activeProjects,
                successProjects
            };
        
        }
        return userResponse;
    }
}
