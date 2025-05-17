import { ContentStatus } from "@/common/entities/content.entity";

export class TaskCalendarResponseDto {
    contentId: number;
    projectId: number;
    projectName: string;
    title: string;
    deadline: Date;
    status: ContentStatus;
}