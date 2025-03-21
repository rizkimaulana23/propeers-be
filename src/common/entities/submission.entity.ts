import { Column, Entity, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Deliverable } from "./deliverables.entity";

@Entity('submission')
export class Submission extends BaseEntity {
    @Column({ nullable: true , default: 0})
    submissionCount: number;

    @Column({ nullable: false })
    title: string;

    @Column({ nullable: false })
    submissionUrl: string;

    @Column({ nullable: false, default: false })
    isVerified: boolean;

    @Column({ nullable: true })
    smsRevision: string;

    @Column({ nullable: true, type: 'timestamp' })
    smsRevisionCreatedDate: Date;

    @Column({ nullable: true })
    clientRevision: string;

    @Column({ nullable: true, type: 'timestamp' })
    clientRevisionCreatedDate: Date;

    @OneToMany(() => Deliverable, (deliverable) => deliverable.submisssions)
    @JoinColumn({ name: 'deliverableId' })
    deliverable: Deliverable;

    @Column({ nullable: true })
    deliverableId: string;
}