import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Submission } from "./submission.entity";
import { Project } from "./project.entity";
import { ContentPillar, JenisPostingan, TargetAudience } from "src/content/dto/request/create-content.dto";
import { IsUrl } from "class-validator";

export enum ContentStatus {
    IN_PROGRESS = 'In Progress',
    FINISHED = 'Finished',
    LATE = 'Late',
    UPLOADED = 'Uploaded',
    CANCELLED = 'Cancelled'
}

@Entity('content')
export class Content extends BaseEntity {
    @Column({ nullable: false })
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    caption: string;

    @IsUrl({}, { each: true }) 
    @Column("text", { 
        array: true,
        nullable: true 
    })
    references: string[];

    @IsUrl()
    @Column({ nullable: true, type: 'text' })
    uploadLink: string | null;

    @Column({ nullable: true, type: 'timestamp'})
    uploadLinkTimestamp: Date | null;

    @Column({ nullable: false, type: 'date' })
    deadline: Date;

    @Column({ nullable: false , type:"enum", enum: JenisPostingan})
    type: JenisPostingan;

    @Column({ nullable: false, type: "enum", enum: ContentPillar })
    pillar: ContentPillar;

    @Column({ nullable: false, type: 'date' }) 
    uploadDate: Date;

    @Column({ nullable: false, type: 'enum', enum: TargetAudience })
    targetAudience: TargetAudience;

    @Column({ nullable: false, type: 'enum', enum: ContentStatus, default: ContentStatus.IN_PROGRESS })
    status: ContentStatus;

    @Column({ nullable: false, default: 0 })
    viewsAmount: number;

    @Column({ nullable: false, default: 0 })
    likesAmount: number;
    
    @Column({ nullable: false, default: 0 })
    commentAmount: number;

    @Column({ nullable: false, default: 0 })
    shareAmount: number;

    @Column({ nullable: true })
    performance: string;

    @Column({ nullable: true })
    performanceNote: string;

    @Column({ nullable: true, type: 'timestamp' })
    evaluationTimestamp: Date;

    @Column({ nullable: true })
    descriptiveEvaluation: string;

    @ManyToOne(() => Project, project => project.deliverables, { eager: true })
    @JoinColumn({ name: 'projectId' })
    project: Project;

    @Column({ nullable: true })
    projectId: number; 

    @OneToMany(() => Submission, (submision) => submision.content)
    submisssions: Submission[]; 
}