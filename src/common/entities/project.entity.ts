import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { User } from "./user.entity";
import { ProjectReferences } from "./projectReferences.entity";
import { Activity } from "./activity.entity";
import { Commission } from "./commission.entity";
import AssignedRoles from "./assignedRoles.entity";
import { IsUrl } from "class-validator";
import { Content } from "./content.entity";

export enum ProjectStatus {
    CREATED = 'CREATED',
    ONGOING = 'ONGOING',
    FINISHED = 'FINISHED',
    CANCELLED = 'CANCELLED',
}

@Entity('projects')
export class Project extends BaseEntity {
    @Column({ nullable: false })
    projectName: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: false, type: 'timestamp' })
    startDate: Date;

    @Column({ nullable: false, type: 'timestamp' })
    finishedDate: Date;

    @Column({ type: 'float', nullable: false })
    fee: number;

    @IsUrl()
    @Column({ nullable: false })
    mou: string;

    @IsUrl()
    @Column({ nullable: true })
    canvaWhiteboard: string;

    @IsUrl()
    @Column({ nullable: true })
    boardPinterest: string;

    @Column({ nullable: true })
    bonus: string;

    @Column({ nullable: false, type: 'enum', enum: ProjectStatus, default: ProjectStatus.CREATED })
    status: ProjectStatus;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'clientId' })
    client: User;

    @Column({ nullable: true })
    clientId: number;

    @OneToMany(() => Content, content => content.project)
    deliverables: Content[];

    @OneToMany(() => ProjectReferences, projectReferences => projectReferences.project, { eager: true})
    projectReferences: ProjectReferences[];

    @OneToMany(() => Activity, (activities) => activities.project)
    activities: Activity[];

    @OneToMany(() => Commission, (commission) => commission.project)
    commissions: Commission[];

    @OneToMany(() => AssignedRoles, (assignedRoles) => assignedRoles.project)
    assignedRoles: AssignedRoles[];
}

