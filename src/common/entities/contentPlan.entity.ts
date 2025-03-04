import { Column, Entity, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Project } from "./project.entity";
import { Deliverable } from "./deliverables.entity";

@Entity('content_plan')
export class ContentPlan extends BaseEntity {
    @Column({ nullable: true })
    pinterestBoardUrl: string;

    @Column({ nullable: true })
    whiteboardUrl: string;

    @OneToOne(() => Project, (project) => project.contentPlan)
    @JoinColumn({ name: 'projectId' })
    project: Project;

    @Column({ nullable: true })
    projectId: number;

    @OneToMany(() => Deliverable, deliverable => deliverable.contentPlan)
    deliverables: Deliverable[];
}