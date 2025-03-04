import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Project } from "./project.entity";

@Entity('activity')
export class Activity extends BaseEntity {

    @Column({ nullable: false })
    title: string

    @Column({ nullable: false, type: 'date'})
    date: Date;

    @Column({ nullable: true })
    description: string;

    @ManyToOne(() => Project, (project) => project.activities)
    @JoinColumn({ name: 'projectId' })
    project: Project;

    @Column({ nullable: true })
    projectId: number;
} 