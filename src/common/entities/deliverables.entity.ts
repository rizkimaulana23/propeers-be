import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { ContentPlan } from "./contentPlan.entity";
import { BaseEntity } from "./base.entity";
import { Submission } from "./submission.entity";

@Entity('deliverable')
export class Deliverable extends BaseEntity {
    @Column({ nullable: false })
    title: string;

    @Column({ nullable: false })
    deadline: Date;

    @Column({ nullable: false })
    type: string;

    @Column({ nullable: false })
    pillar: string;

    @Column({ nullable: false })
    uploadDate: Date;

    @Column({ nullable: false })
    status: string;

    @Column({ nullable: true })
    viewsAmount: number;

    @Column({ nullable: true })
    likesAmount: number;
    
    @Column({ nullable: true })
    commentAmount: number;

    @Column({ nullable: true })
    shareAmount: number;

    @ManyToOne(() => ContentPlan, contentPlan => contentPlan.deliverables)
    @JoinColumn({ name: 'contentPlanId' })
    contentPlan: ContentPlan;

    @Column({ nullable: true })
    contentPlanId: number; 

    @OneToMany(() => Submission, (submision) => submision.deliverable)
    submisssions: Submission[];
}