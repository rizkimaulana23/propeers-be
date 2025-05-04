import { Column, Entity, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Content } from "./content.entity";

@Entity('submission')
export class Submission extends BaseEntity {
    @Column({ nullable: true , default: 0})
    submissionCount: number;

    @Column({ nullable: false })
    catatanSubmisi: string;

    @Column({ nullable: false })
    submissionUrl: string;

    @Column({ nullable: false, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    submitTimestamp: Date;

    @Column({ nullable: false, default: false })
    isVerified: boolean;
    
    @Column({ nullable: false, default: false })
    isAcceptedByClient: boolean;

    @Column({ nullable: true })
    submittedBy: string;

    @Column({ nullable: true })
    smsRevision: string;

    @Column({ nullable: true, type: 'timestamp' })
    smsRevisionCreatedDate: Date;

    @Column({ nullable: true })
    clientRevision: string;

    @Column({ nullable: true, type: 'timestamp' })
    clientRevisionCreatedDate: Date;

    @Column({ nullable: true, type: 'int' })
    durasiLate: number | null;

    @Column({ nullable: true, type: 'int' })
    durasiOnTime: number | null;

    @OneToMany(() => Content, (content) => content.submisssions)
    @JoinColumn({ name: 'contentId' })
    content: Content;

    @Column({ nullable: true })
    contentId: number;
}