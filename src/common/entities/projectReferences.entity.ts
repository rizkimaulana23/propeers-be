import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Project } from "./project.entity";
import { BaseEntity } from "./base.entity";

@Entity('project_references')
export class ProjectReferences extends BaseEntity {
    @Column({ nullable: false })
    title: string;

    @Column({ nullable: false })
    type: string;

    @Column({ nullable: false })
    url: string;

    @ManyToOne(() => Project, project => project.projectReferences)
    @JoinColumn({ name: 'projectId' })
    project: Project;

    @Column({ nullable: false })
    projectId: string;
}