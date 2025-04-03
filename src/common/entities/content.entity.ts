import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Submission } from "./submission.entity";
import { Project } from "./project.entity";
import { ContentPillar, JenisPostingan, TargetAudience } from "src/content/dto/request/create-content.dto";

@Entity('content')
export class Content extends BaseEntity {
    @Column({ nullable: false })
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    caption: string;

    @Column({ nullable: false })
    deadline: Date;

    @Column({ nullable: false , type:"enum", enum: JenisPostingan})
    type: JenisPostingan;

    @Column({ nullable: false, type: "enum", enum: ContentPillar })
    pillar: ContentPillar;

    @Column({ nullable: false })
    uploadDate: Date;

    @Column({ nullable: false, type: 'enum', enum: TargetAudience })
    targetAudience: TargetAudience;

    @Column({ nullable: false, default: 'CREATED'})
    status: string;

    @Column({ nullable: true })
    viewsAmount: number;

    @Column({ nullable: true })
    likesAmount: number;
    
    @Column({ nullable: true })
    commentAmount: number;

    @Column({ nullable: true })
    shareAmount: number;

    @ManyToOne(() => Project, project => project.deliverables, { eager: true })
    @JoinColumn({ name: 'projectId' })
    project: Project;

    @Column({ nullable: true })
    projectId: number; 

    @OneToMany(() => Submission, (submision) => submision.content)
    submisssions: Submission[];
}