import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { BaseEntity } from "./base.entity";

export enum NotificationStatus {

}

@Entity('notification')
export class Notification extends BaseEntity {
    @Column({ nullable: false })
    message: string;

    @Column({ nullable: false, type:'enum', enum: NotificationStatus })
    status: NotificationStatus;

    @Column({ nullable: false })
    senderId: string;

    @Column({ nullable: true })
    actionUrl: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId'})
    user: User;

    @Column({ nullable: true })
    userId: number;

}