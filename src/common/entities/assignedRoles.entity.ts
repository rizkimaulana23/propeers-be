import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Talent } from "./user/talent.entity";
import { Project } from "./project.entity";

@Entity('assigned_roles')
export default class AssignedRoles extends BaseEntity {
    @Column({ nullable: false })
    role: string;
    
    @Column({ nullable: false })
    briefNotesUrl: string;

    @ManyToOne(() => Talent, (talent) => talent.assignedRoles)
    @JoinColumn({ name: 'talentId' })
    talent: Talent; 

    @Column({ nullable: true })
    talentId: number;

    @ManyToOne(() => Project, (project) => project.assignedRoles)
    @JoinColumn({ name: 'projectId' })
    project: Project;

    @Column({ nullable: true })
    projectId: number;
    
}