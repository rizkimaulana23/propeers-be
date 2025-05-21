import { NotificationType, RelatedEntityType } from "../../notification.enums";

export class NotificationResponseDto {
    id: number;
    userId: number;
    type: NotificationType;
    message: string;
    isRead: boolean;
    relatedEntityId?: number;
    relatedEntityType?: RelatedEntityType;
    link?: string;
    createdAt: Date;

    constructor(partial: Partial<NotificationResponseDto>) {
        Object.assign(this, partial);
    }
}
