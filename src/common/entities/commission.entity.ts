import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Project } from "./project.entity";
import { User } from "./user.entity";

@Entity('commissions')
export class Commission extends BaseEntity {
    @Column({ nullable: false, type: 'numeric', precision: 10, scale: 2 })
    commissionAmount: number;

    @ManyToOne(() => Project, (project) => project.commissions)
    @JoinColumn({ name: 'projectId' })
    project: Project;

    @Column({ nullable: false })
    projectId: number;

    @ManyToOne(() => User, (user) => user.commissions)
    @JoinColumn({ name: 'talentId' })
    talent: User;

    @Column({ nullable: false })
    talentId: number;

    @Column({nullable: true})
    isTransferred: boolean;
}