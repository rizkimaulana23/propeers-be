import { BaseEntity } from "src/common/entities/base.entity";
import { User } from "src/common/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { NotificationType, RelatedEntityType } from "../../notification/notification.enums";

@Entity('notifications')
export class Notification extends BaseEntity {
    @Column()
    userId: number; // ID of the user who should receive the notification

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'enum', enum: NotificationType })
    type: NotificationType;

    @Column('text')
    message: string;

    @Column({ default: false })
    isRead: boolean;

    @Column({ nullable: true })
    relatedEntityId?: number;

    @Column({ type: 'enum', enum: RelatedEntityType, nullable: true })
    relatedEntityType?: RelatedEntityType;

    @Column({ nullable: true })
    link?: string; // Optional: direct link for frontend navigation
}
