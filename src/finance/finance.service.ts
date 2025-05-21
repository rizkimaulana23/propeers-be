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
import { UpdateKomisiTalentDTO } from './dto/request/update-komisi-talent.dto';
import { DetailFinanceDTO } from './dto/response/detail-finance.dto';
import { NotificationService } from 'src/notification/notification.service'; // Import NotificationService
import { NotificationType, RelatedEntityType } from 'src/notification/notification.enums'; // Import enums
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
        private readonly projectService: ProjectService,
        private readonly notificationService: NotificationService, // Inject NotificationService
    ){}
    
    async createKomisiTalent(createKomisiTalentDto : CreateKomisiTalentDto){
        const {commissionAmount, talentId, projectId} = createKomisiTalentDto;

        const project = await this.projectRepository.findOne({
            where: { id: projectId },
            relations: ['commissions'],
        });
    
        if (!project)
            throw new FailedException(
            `Project dengan ID ${projectId} tidak ditemukan`,
            HttpStatus.NOT_FOUND,
            this.request.path,
        );

        let totalKomisi = 0;

        if (project.commissions.length != 0){
            for (const komisi of project.commissions) {
                totalKomisi += Number(komisi.commissionAmount);
            }
        }

        if (totalKomisi + commissionAmount > project.fee){
            throw new FailedException(
                `Jumlah komisi yang dimasukkan melebihi available budget`,
                HttpStatus.INTERNAL_SERVER_ERROR,
                this.request.path,
            );
        }

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

    async updateKomisiTalent(updateKomisiTalentDto : UpdateKomisiTalentDTO) {
        const {commissionAmount, talentId, projectId} = updateKomisiTalentDto;

        const komisiTalent: Commission | null = await this.commisionRepository.findOne({
            where: {
                talentId,
                projectId
            }
        })

        if (!komisiTalent) {
            throw new FailedException(
                `Commision dari proyek dengan ID ${updateKomisiTalentDto.projectId} dan talent dengan ID ${updateKomisiTalentDto.talentId} tidak ditemukan`, 
                HttpStatus.NOT_FOUND, 
                this.request.path);
        }

        const project = await this.projectRepository.findOne({
            where: { id: projectId },
        });
    
        if (!project)
            throw new FailedException(
            `Project dengan ID ${projectId} tidak ditemukan`,
            HttpStatus.NOT_FOUND,
            this.request.path,
        );

        let totalKomisi = 0;

        if (project.commissions != null){
            for (const komisi of project.commissions) {
                totalKomisi += Number(komisi.commissionAmount);
            }
        }

        if (totalKomisi - komisiTalent.commissionAmount + commissionAmount > project.fee){
            throw new FailedException(
                `Jumlah komisi yang dimasukkan melebihi available budget`,
                HttpStatus.INTERNAL_SERVER_ERROR,
                this.request.path,
            );
        }

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

        if (komisiTalent.isTransferred == true){
            throw new FailedException(
                `Tidak dapat memperbarui komisi karena komisi sudah ditransfer`, 
                HttpStatus.INTERNAL_SERVER_ERROR,
                this.request.path
            );
        }

        komisiTalent.commissionAmount = commissionAmount;
        komisiTalent.project = project;
        komisiTalent.talent = talent;

        return this.turnCommissionToCommissionResponse(await this.commisionRepository.save(komisiTalent));
    }

    async updateTransferredKomisi(projectId : number, talentId : number) {
        const komisiTalent: Commission | null = await this.commisionRepository.findOne({
            where: {
                talentId: talentId,
                projectId: projectId
            }
        })

        if (!komisiTalent) {
            throw new FailedException(
                `Commision dari proyek dengan ID ${projectId} dan talent dengan ID ${talentId} tidak ditemukan`, 
                HttpStatus.NOT_FOUND, 
                this.request.path);
        }

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

        komisiTalent.isTransferred = true;
        komisiTalent.project = project;
        komisiTalent.talent = talent;

        const savedCommission = await this.commisionRepository.save(komisiTalent);

        // Create notification for the talent
        if (savedCommission.talent && savedCommission.project) {
            await this.notificationService.createNotification({
                userId: savedCommission.talent.id,
                type: NotificationType.COMMISSION_TRANSFERRED,
                message: `Your commission of ${savedCommission.commissionAmount} for project "${savedCommission.project.projectName}" has been transferred.`,
                relatedEntityId: savedCommission.project.id, // or commission.id
                relatedEntityType: RelatedEntityType.PROJECT, // or RelatedEntityType.COMMISSION
                link: `/finance/projects/${savedCommission.project.id}` // Example link
            });
        }

        return this.turnCommissionToCommissionResponse(savedCommission);
    }

    async detailFinanceProject(projectId : number){
        const project = await this.projectRepository.findOne({
            where: { id: projectId },
            relations: ['commissions', 'commissions.project', 'commissions.talent']
        });

        if (!project)
            throw new FailedException(
            `Project dengan ID ${projectId} tidak ditemukan`,
            HttpStatus.NOT_FOUND,
            this.request.path,
        );

        const mapProportionRole = new Map<string, number>();

        let totalForKomisi = 0;

        if (project.commissions != null){
            for (const komisi of project.commissions) {
                const assignedRoleKomisi = await this.assignedRolesRepository.findOne({
                    where: {
                        projectId : komisi.projectId,
                        talentId : komisi.talentId,
                    }, 
                    relations: ['project'],
                });
                if (assignedRoleKomisi != null){
                    const roleKey = assignedRoleKomisi.role;
                    if (mapProportionRole.has(roleKey)) {
                        const currentTotal = mapProportionRole.get(roleKey) ?? 0;
                        const newTotal = currentTotal + komisi.commissionAmount
                        mapProportionRole.set(roleKey, newTotal);
                    }
                    else {
                        if (roleKey == "-"){
                            mapProportionRole.set("Social Media Specialist", Number(komisi.commissionAmount));
                        } else {
                            mapProportionRole.set(roleKey, Number(komisi.commissionAmount));
                        }
                    };
                };
                
                totalForKomisi += Number(komisi.commissionAmount);
            }
            mapProportionRole.set("Artsy", project.fee - totalForKomisi);
        };

        const commissionResponses : CommissionResponseDTO[] = project.commissions.map((commission) => this.turnCommissionToCommissionResponse(commission))

        const response = new DetailFinanceDTO({
            totalCommssion : totalForKomisi,
            mapProportion : mapProportionRole,
            project: this.projectService.turnProjectIntoProjectResponse(project),
            listCommissionProject : commissionResponses
        });

        return response;
    }

    turnCommissionToCommissionResponse(commision: Commission) {        
        const response = new CommissionResponseDTO({
            id: commision.id,
            commisionAmount: commision.commissionAmount,
            isTransferred: commision.isTransferred,
            project: this.projectService.turnProjectIntoProjectResponse(commision.project),
            talent: this.userService.turnUserToUserResponse(commision.talent)
        })

        return response;
    }
}
