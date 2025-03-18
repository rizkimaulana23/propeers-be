import { Column, Entity, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Content } from "./content.entity";

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

    @OneToMany(() => Content, (content) => content.submisssions)
    @JoinColumn({ name: 'contentId' })
    content: Content;

    @Column({ nullable: true })
    contentId: string;
}