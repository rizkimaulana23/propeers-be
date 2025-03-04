import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Speciality } from "./speciality.entity";
import { Project } from "./project.entity";
import { Notification } from "./notification.entity";

export enum Role {
    ADMIN = 'ADMIN',
    SMS = 'SMS',
    FREELANCER = 'FREELANCER',
    CLIENT = 'CLIENT',
    GM = 'GM',
    DIREKSI = 'DIREKSI',
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

    @OneToMany(() => Project, (project) => project.client)
    projects: Project[];

    @OneToMany(() => Notification, (notifications) => notifications.user)
    notifications: Notification[];
}