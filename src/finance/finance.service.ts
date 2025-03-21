import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import AssignedRoles from 'src/common/entities/assignedRoles.entity';
import { Commission } from 'src/common/entities/commission.entity';
import { Project } from 'src/common/entities/project.entity';
import { User } from 'src/common/entities/user.entity';
import { Repository } from 'typeorm/repository/Repository';
import { CreateKomisiTalentDto } from './dto/request/create-komisi-talent.dto';
import { FailedException } from 'src/common/exceptions/FailedExceptions.dto';
import { Request } from 'express';
import { CommissionResponseDTO } from './dto/response/commission-response.dto';
import { UserService } from 'src/user/user.service';
import { ProjectService } from 'src/project/project.service';
// import { In } from 'typeorm';


@Injectable()
export class FinanceService {
    constructor (
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(AssignedRoles)
        private readonly assignedRolesRepository: Repository<AssignedRoles>,
        @InjectRepository(Commission)
        private readonly commisionRepository: Repository<Commission>,
        @Inject(REQUEST) private readonly request: Request,
        private readonly userService: UserService,
        private readonly projectService: ProjectService
    ){}
    
    async createKomisiTalent(createKomisiTalentDto : CreateKomisiTalentDto){
        const {commissionAmount, talentId, projectId} = createKomisiTalentDto;

        const project = await this.projectRepository.findOne({
            where: { id: projectId },
        });
    
        if (!project)
            throw new FailedException(
            `Project dengan ID ${projectId} tidak ditemukan`,
            HttpStatus.NOT_FOUND,
            this.request.path,
        );

        const talent = await this.userRepository.findOne({
            where: { id: talentId },
            relations: ['assignedRoles', 'assignedRoles.project'],
        });
      
        if (!talent)
            throw new FailedException(
            `Talent dengan ID ${talentId} tidak ditemukan`,
            HttpStatus.NOT_FOUND,
            this.request.path,
            );

        const commision = this.commisionRepository.create({
            commissionAmount: commissionAmount,
            project: project,
            talent: talent,
        });

        await this.commisionRepository.save(commision);
        
        return this.turnCommissionToCommissionResponse(commision);
    }

    turnCommissionToCommissionResponse(commision: Commission) {
        if (!commision) return undefined;
        
        const response = new CommissionResponseDTO({
            id: commision.id,
            commisionAmount: commision.commissionAmount,
            project: this.projectService.turnProjectIntoProjectResponse(commision.project),
            talent: this.userService.turnUserToUserResponse(commision.talent)
        })

        return response;
      }







}
