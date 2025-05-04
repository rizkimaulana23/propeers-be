import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Project } from "./project.entity";
import { User } from "./user.entity";

@Entity('assigned_roles')
export default class AssignedRoles extends BaseEntity {
    @Column({ nullable: false })
    role: string;
    
    @Column({ nullable: true })
    briefNotesUrl: string;

    @ManyToOne(() => User, (user) => user.assignedRoles)
    @JoinColumn({ name: 'talentId' })
    talent: User; 

    @Column({ nullable: true })
    talentId: number;

    @ManyToOne(() => Project, (project) => project.assignedRoles)
    @JoinColumn({ name: 'projectId' })
    project: Project;

    @Column({ nullable: true })
    projectId: number;
    
}