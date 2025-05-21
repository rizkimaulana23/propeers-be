import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../common/entities/notification.entity';
import { CreateNotificationDto } from './dto/request/create-notification.dto';
import { NotificationResponseDto } from './dto/response/notification-response.dto';
import { User } from 'src/common/entities/user.entity';
import { FailedException } from 'src/common/exceptions/FailedExceptions.dto';
import { REQUEST } from '@nestjs/core';
import { AuthenticatedRequest } from 'src/common/interfaces/custom-request.interface';
import { Content } from 'src/common/entities/content.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationType, RelatedEntityType } from './notification.enums';

@Injectable({ scope: Scope.REQUEST })
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
        @InjectRepository(User) // To fetch user details if needed for messages
        private userRepository: Repository<User>,
        @InjectRepository(Content)
        private contentRepository: Repository<Content>,
        @Inject(REQUEST) private readonly request: AuthenticatedRequest,
    ) {}

    async createNotification(dto: CreateNotificationDto): Promise<Notification> {
        const notification = this.notificationRepository.create(dto);
        return this.notificationRepository.save(notification);
    }

    async getNotificationsForUser(): Promise<NotificationResponseDto[]> {
        const userId = this.request.user?.id;
        const notifications = await this.notificationRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
        return notifications.map(n => new NotificationResponseDto({
            id: n.id,
            userId: n.userId,
            type: n.type,
            message: n.message,
            isRead: n.isRead,
            relatedEntityId: n.relatedEntityId,
            relatedEntityType: n.relatedEntityType,
            link: n.link,
            createdAt: n.createdAt,
        }));
    }
    
    async markAsRead(notificationId: number): Promise<NotificationResponseDto> {
        const userId = this.request.user?.id;
        const notification = await this.notificationRepository.findOne({ where: { id: notificationId, userId } });
        if (!notification) {
            throw new FailedException('Notification not found or access denied', HttpStatus.NOT_FOUND, this.request.path);
        }
        notification.isRead = true;
        await this.notificationRepository.save(notification);
        return new NotificationResponseDto(notification);
    }

    async markAllAsRead(): Promise<{ success: boolean; count: number }> {
        const userId = this.request.user?.id;
        const result = await this.notificationRepository.update({ userId, isRead: false }, { isRead: true });
        return { success: true, count: result.affected || 0 };
    }

    // This method would be triggered by a cron job
    @Cron(CronExpression.EVERY_DAY_AT_7AM)
    async sendDeadlineReminders() {
        console.log('Running daily deadline reminder job...');
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        const contentsDueToday = await this.contentRepository
            .createQueryBuilder('content')
            .leftJoinAndSelect('content.project', 'project')
            .leftJoinAndSelect('project.assignedRoles', 'assignedRoles')
            .leftJoinAndSelect('assignedRoles.talent', 'talent')
            .where('content.deadline = :today', { today: today.toISOString().split('T')[0] })
            .andWhere("talent.id IS NOT NULL")
            .getMany();

        for (const content of contentsDueToday) {
            if (content.project && content.project.assignedRoles) {
                for (const assignment of content.project.assignedRoles) {
                    if (assignment.talent) {
                        const notificationDto: CreateNotificationDto = {
                            userId: assignment.talent.id,
                            type: NotificationType.CONTENT_DEADLINE_REMINDER,
                            message: `Reminder: Content "${content.title}" for project "${content.project.projectName}" is due today!`,
                            relatedEntityId: content.id,
                            relatedEntityType: RelatedEntityType.CONTENT,
                            link: `/projects/${content.projectId}/contents/${content.id}` // Example link
                        };
                        await this.createNotification(notificationDto);
                        console.log(`Sent deadline reminder for content ${content.id} to talent ${assignment.talent.id}`);
                    }
                }
            }
        }
    }
}
