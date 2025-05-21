import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";
import { NotificationType, RelatedEntityType } from "../../notification.enums";

export class CreateNotificationDto {
    @IsInt()
    @IsNotEmpty()
    userId: number;

    @IsEnum(NotificationType)
    @IsNotEmpty()
    type: NotificationType;

    @IsString()
    @IsNotEmpty()
    message: string;

    @IsInt()
    @IsOptional()
    relatedEntityId?: number;

    @IsEnum(RelatedEntityType)
    @IsOptional()
    relatedEntityType?: RelatedEntityType;

    @IsUrl()
    @IsOptional()
    link?: string;
}
