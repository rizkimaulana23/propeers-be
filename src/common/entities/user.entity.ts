import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Project } from "./project.entity";
import { Notification } from "./notification.entity";
import { Commission } from "./commission.entity";
import { Speciality } from "./speciality.entity";
import AssignedRoles from "./assignedRoles.entity";

export enum Role {
    ADMIN = 'ADMIN',
    SMS = 'SMS',
    FREELANCER = 'FREELANCER',
    CLIENT = 'CLIENT',
    GM = 'GM',
    DIREKSI = 'DIREKSI',
}

export enum TalentStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED'
}

@Entity('users')
export class User extends BaseEntity {
    @Column({ nullable: false })
    email: string;

    @Column({ nullable: false })
    hashedPassword: string;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    phone: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: false, type: 'enum', enum: Role, default: Role.FREELANCER })
    role: Role;

    @Column({ nullable: true })
    photo: string; 

    // Fields for Talent (SMS/FREELANCER roles)
    @Column({ nullable: true, type: 'enum', enum: TalentStatus })
    talentStatus: TalentStatus;

    @Column({ nullable: true })
    bankName: string;

    @Column({ nullable: true })
    bankAccountNumber: string;

    @Column({ nullable: true })
    bankAccountName: string;

    // Relationships
    @OneToMany(() => Project, (project) => project.client)
    projects: Project[];

    @OneToMany(() => Notification, (notifications) => notifications.user)
    notifications: Notification[];

    @OneToMany(() => Commission, (commission) => commission.talent)
    commissions: Commission[];

    @OneToMany(() => AssignedRoles, (assignedRoles) => assignedRoles.talent)
    assignedRoles: AssignedRoles[];

    @ManyToMany(() => Speciality, (speciality) => speciality.users, { eager: true })
    @JoinTable({
        name: 'user_specialities',
        joinColumn: { name: 'userId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'specialityId', referencedColumnName: 'speciality' }
    })
    specialities: Speciality[];
}