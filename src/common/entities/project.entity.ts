import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { User } from "./user.entity";
import { ContentPlan } from "./contentPlan.entity";
import { ProjectReferences } from "./projectReferences.entity";
import { Activity } from "./activity.entity";
import { Commission } from "./commission.entity";
import AssignedRoles from "./assignedRoles.entity";

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

    @Column({ nullable: false, type: 'timestamp' })
    startDate: Date;

    @Column({ nullable: false, type: 'timestamp' })
    finishedDate: Date;

    @Column({ type: 'float', nullable: false })
    fee: number;

    @Column({ nullable: false })
    mou: string;

    @Column({ nullable: false, type: 'enum', enum: ProjectStatus, default: ProjectStatus.CREATED })
    status: ProjectStatus;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'clientId' })
    client: User;

    @Column({ nullable: false })
    clientId: number;

    @OneToOne(() => ContentPlan, contentPlan => contentPlan.project)
    contentPlan: ContentPlan;

    @OneToMany(() => ProjectReferences, projectReferences => projectReferences.project)
    projectReferences: ProjectReferences[];

    @OneToMany(() => Activity, (activities) => activities.project)
    activities: Activity[];

    @OneToMany(() => Commission, (commission) => commission.project)
    commissions: Commission[];

    @OneToMany(() => AssignedRoles, (assignedRoles) => assignedRoles.project)
    assignedRoles: AssignedRoles[];
}

