import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Project } from "./project.entity";
import { Talent } from "./user/talent.entity";

@Entity('commission')
export class Commission extends BaseEntity {
    @Column({ nullable: false, type: 'float' })
    commissionAmount: number; 

    @ManyToOne(() => Project, (project) => project.commissions)
    @JoinColumn({ name: 'projectId'})
    project: Project;

    @Column({ nullable: true })
    projectId: number;

    @ManyToOne(() => Talent, (talent) => talent.commissions)
    @JoinColumn({ name: 'talentId' })
    talent: Talent;

    @Column({ nullable: true })
    talentId: number;

}