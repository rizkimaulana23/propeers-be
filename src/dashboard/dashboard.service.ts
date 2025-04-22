import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Content, ContentStatus } from 'src/common/entities/content.entity';
import { Project, ProjectStatus } from 'src/common/entities/project.entity';
import { Role, TalentStatus, User } from 'src/common/entities/user.entity';
import { AuthenticatedRequest } from 'src/common/interfaces/custom-request.interface';
import { In, Repository } from 'typeorm';
import { TaskCalendarResponseDto } from './dto/TaskCalendarResponseDto';
import AssignedRoles from 'src/common/entities/assignedRoles.entity';
import { FailedException } from 'src/common/exceptions/FailedExceptions.dto';
import { TalentPieChartResponseDto } from './dto/TalentPieChart';
import { CardDataResponseDto } from './dto/CardData';
import { Commission } from 'src/common/entities/commission.entity';
import { IncomeLineChartResponseDto } from './dto/IncomeLineChartResponseDto';
import { MonthlyProjectBarChartResponseDto } from './dto/MonthlyProjectBarChartResponseDto';
import { DeliverableChartResponseDto } from './dto/DeliverableChart';
import { Submission } from 'src/common/entities/submission.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        @InjectRepository(Content)
        private readonly contentRepository: Repository<Content>,
        @InjectRepository(AssignedRoles)
        private readonly assignedRolesRepository: Repository<AssignedRoles>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Commission)
        private readonly commissionRepository: Repository<Commission>,
        @InjectRepository(Submission)
        private readonly submissionRepository: Repository<Submission>,
        @Inject(REQUEST) private readonly request: AuthenticatedRequest,
    ) {}

    async getSummaryActiveProject() {
        if (!this.request.user) return; 

        let projects: Project[];
        if (this.request.user.roles === Role.DIREKSI) {
            projects = await this.projectRepository.find({
                where: {
                    status: ProjectStatus.ONGOING
                }
            }); 
        } else if (this.request.user.roles === Role.SMS) {
            const assignedRoles: AssignedRoles[] = await this.assignedRolesRepository.find({ where: {
                talentId: this.request.user.id
            }});
            projects = await this.projectRepository.find({ where: {
                id: In(assignedRoles.map((ar) => ar.projectId)),
                status: ProjectStatus.ONGOING
            }})
        } else {
            projects = []
        }

        let red = 0;
        let green = 0;
        let yellow = 0;
        for (const project of projects) {
            let score = 100;
            const contents = await this.contentRepository.find({ where: {
                projectId: project.id
            }});
            for (const content of contents) {
                const submissions: Submission[] = await this.submissionRepository.find({
                    where: {
                        contentId: content.id
                    },
                    order: {
                        submissionCount: "DESC"
                    }
                })

                let hasSubmitted = false;
                if (submissions.length > 0) hasSubmitted = true; 
                    
                if (hasSubmitted) {
                    const latestSubmission: Submission = submissions[0];
                    if (latestSubmission.createdAt > content.deadline) {
                        const difference = this.getDifferenceInDays(latestSubmission.createdAt, content.deadline);
                        score = score - (difference * 5);
                    } else {
                        score += 10;
                    }
                } else {
                    const now = new Date();
                    if (now > content.deadline) {
                        const difference = this.getDifferenceInDays(now, content.deadline);
                        score = score - (difference * 5);
                    } else {
                        score += 10;
                    }
                }
            }
            if (score >= 85) green += 1;
            else if (score >= 60 || score < 85) yellow += 1;
            else red += 1;   
        }
        return {
            red,
            yellow,
            green
        }
    }

    getDifferenceInDays(date1: Date, date2: Date): number {
        const msPerDay = 1000 * 60 * 60 * 24;
        
        const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
        const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
        
        return Math.floor((utc2 - utc1) / msPerDay);
    }

    async getDeliverableChart() {
        if (!this.request.user) return; 

        let monthlyData: { [key: string]: number } = {};
        let contents: Content[] = [];
        if (this.request.user.roles === Role.DIREKSI) {
            contents = await this.contentRepository.find();
        } else if (this.request.user.roles === Role.SMS || this.request.user.roles === Role.FREELANCER) {
            const assignedRoles: AssignedRoles[] = await this.assignedRolesRepository.find({
                where: {
                    talentId: this.request.user.id
                }
            });
            const projects: Project[] = await this.projectRepository.find({
                where: {
                    id: In(assignedRoles.map((assignedRole) => assignedRole.projectId))
                }
            })
            projects.forEach((project) => {
                contents.push(...project.deliverables);
            })
        }

        contents.map((content) => {
            const date = new Date(content.deadline);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const period = `${year}-${month.toString().padStart(2, '0')}`;
            
            if (period in monthlyData) monthlyData[period]++;
            else monthlyData[period] = 1; 
        })

        console.log(monthlyData)

        const data: DeliverableChartResponseDto[] = Object.entries(monthlyData).map(([period, amount]) => {
            return {
                period,
                amount
            };
        });

        return data;
    }

    async getMonthlyProjectBarChart() {
        if (!this.request.user) return;

        let projects: Project[] = [];
        if (this.request.user.roles === Role.DIREKSI) {
            projects = await this.projectRepository.find();
        } else if (this.request.user.roles === Role.SMS || this.request.user.roles === Role.FREELANCER) {
            const assignedRoles: AssignedRoles[] = await this.assignedRolesRepository.find({
                where: {
                    talentId: this.request.user.id
                }
            });

            projects = await this.projectRepository.find({
                where: {
                    id: In(assignedRoles.map((ar) => ar.projectId))
                }
            });
        }

        const monthlyData: { [key: string]: number } = {};
        projects.map((project) => {
            const date = new Date(project.startDate);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const period = `${year}-${month.toString().padStart(2, '0')}`;

            if (period in monthlyData) monthlyData[period]++;
            else monthlyData[period] = 1;
        })

        const data: MonthlyProjectBarChartResponseDto[] = Object.entries(monthlyData).map(([period, amount]) => {
            return {
                period,
                amount
            };
        });

        return data;
    }

    async getActiveTalentPieChart(): Promise<TalentPieChartResponseDto[]> {
        const users: User[] = await this.userRepository.find({
            where: {
                role: In([Role.SMS, Role.FREELANCER]),
                talentStatus: TalentStatus.ACTIVE
            }
        })
        const response: TalentPieChartResponseDto[] = [];
        let data: { [key: string]: number } = {};
        for (const user of users) {
            for (const speciality of user.specialities) {
                if (speciality.speciality in data) {
                    data[speciality.speciality]++;
                } else {
                    data[speciality.speciality] = 1;
                }
            }
        }
        for (const d  in data) {
            response.push({ specialities: d, amount: data[d] })   
        }

        return response;
    }

    async getTaskCalendar(): Promise<TaskCalendarResponseDto[]> {
        if (!this.request.user) return [];

        let response: TaskCalendarResponseDto[] = [];
        let projects: Project[] = [];
        let deliverables: Content[] = [];

        if (this.request.user.roles === Role.DIREKSI) {
            projects = await this.projectRepository.find();
        } else if (this.request.user.roles === Role.SMS || this.request.user.roles === Role.FREELANCER) {
            const assigned: AssignedRoles[] = await this.assignedRolesRepository.find({
                where: {
                    talentId: this.request.user.id
                }
            })
            projects = await this.projectRepository.find({
                where: {
                    assignedRoles: In(assigned)
                }
            })
        } else if (this.request.user.roles === Role.CLIENT) {
            projects = await this.projectRepository.find({
                where: {
                    clientId: this.request.user.id
                }
            })

        } else {
            throw new FailedException("You're not allowed to fetch data for this Task Calendar", HttpStatus.BAD_REQUEST, this.request.path);
        }

        const projectIds = projects.map((project) => project.id)
            deliverables = await this.contentRepository.find({
                where: {
                    project: In(projectIds)
                }
            });

        deliverables.map((deliverable) => {
            response.push({
                contentId: deliverable.id,
                projectId: deliverable.project.id,
                projectName: deliverable.project.projectName,
                deadline: deliverable.deadline,
                title: deliverable.title
            })
        })

        return response;
    }

    async getIncomeLineChart(): Promise<IncomeLineChartResponseDto[]> {
        if (!this.request.user) return [];

        let monthlyData: { [key: string]: number } = {};
        if (this.request.user.roles === Role.DIREKSI) {
            const projects: Project[] = await this.projectRepository.find({
                order: {
                    startDate: 'ASC'
                }
            });

            projects.forEach((project) => {
                const date = new Date(project.startDate);
                const month = date.getMonth() + 1;
                const year = date.getFullYear();
                const period = `${year}-${month.toString().padStart(2, '0')}`;
                
                monthlyData[period] = (monthlyData[period] || 0) + project.fee;
            })
        } else {
            const commissions: Commission[] = await this.commissionRepository.find({
                where: {
                    talentId: this.request.user.id
                }
            })

            commissions.forEach((commission) => {
                const date = new Date(commission.project.startDate);
                const month = date.getMonth() + 1;
                const year = date.getFullYear();
                const period = `${year}-${month.toString().padStart(2, '0')}`;
                
                monthlyData[period] = (monthlyData[period] || 0) + commission.commissionAmount;
            })
        }

        const data: IncomeLineChartResponseDto[] = Object.entries(monthlyData).map(([period, amount]) => {
            return {
                period,
                amount
            };
        });

        return data;
    }

    async getCardData(): Promise<CardDataResponseDto> {
        if (!this.request.user) return {};

        let response: CardDataResponseDto = {}
        if (this.request.user.roles === Role.DIREKSI) {
            response.activeProject = await this.getCardActiveProject();
            response.finishedProject = await this.getCardFinishedProject();
            response.totalTalent = await this.getCardTotalTalent();
            response.totalClient = await this.getCardTotalClient();
        } else if (this.request.user.roles === Role.GM) {
            response.totalClient = await this.getCardTotalClient();
            response.activeProject = await this.getCardActiveProject();
        } else if (this.request.user.roles === Role.SMS || this.request.user.roles === Role.FREELANCER) {
            response.activeProject = await this.getCardActiveProject();
            response.totalClient = await this.getCardTotalClient();
            response.totalIncome = await this.getCardTotalIncome();
        }

        return response;
    }

    async getCardActiveProject() {
        if (!this.request.user) return;
        
        if (this.request.user.roles === Role.DIREKSI) {
            return await this.projectRepository.count({
                where: {
                    status: ProjectStatus.ONGOING
                }
            }) 
        } else if (this.request.user.roles === Role.FREELANCER || this.request.user.roles === Role.SMS) {
            const assignedRoles = await this.assignedRolesRepository.find({ 
                where: {
                    talentId: this.request.user.id
                }
            })
            return await this.projectRepository.count({
                where: {
                    id: In(assignedRoles.map((data) => data.projectId)),
                    status: ProjectStatus.ONGOING
                }
            })  
        }
        return await this.projectRepository.count({
            where: {
                status: ProjectStatus.ONGOING
            }
        })
    }

    async getCardFinishedProject() {
        if (!this.request.user) return;
        
        if (this.request.user.roles === Role.DIREKSI) {
            return await this.projectRepository.count({
                where: {
                    status: ProjectStatus.FINISHED
                }
            }) 
        } else if (this.request.user.roles === Role.FREELANCER || this.request.user.roles === Role.SMS) {
            const assignedRoles = await this.assignedRolesRepository.find({ 
                where: {
                    talentId: this.request.user.id
                }
            })
            return await this.projectRepository.count({
                where: {
                    id: In(assignedRoles.map((data) => data.projectId)),
                    status: ProjectStatus.FINISHED
                }
            })  
        }
        return await this.projectRepository.count({
            where: {
                status: ProjectStatus.FINISHED
            }
        })
    }

    async getCardTotalTalent() {
        return await this.userRepository.count({
            where: {
                role: In([Role.SMS, Role.FREELANCER])
            }
        })
    }

    async getCardTotalClient() {
        return await this.userRepository.count({
            where: {
                role: Role.CLIENT
            }
        })
    }

    async getCardTotalIncome() {
        if (!this.request.user) return 0;
        
        let response = 0;
        if (this.request.user.roles === Role.DIREKSI) {
            const projects: Project[] = await this.projectRepository.find();
            projects.map((project) => {
                response += project.fee
            })
        } else {
            const commissions: Commission[] = await this.commissionRepository.find({
                where: {
                    talentId: this.request.user.id,
                    isTransferred: true
                }
            })
        }

        return response;
    }
}
