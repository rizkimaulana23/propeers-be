import { Controller, Get, Inject, Param, ParseIntPipe, Patch, Scope, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { REQUEST } from '@nestjs/core';
import { AuthenticatedRequest } from 'src/common/interfaces/custom-request.interface';
import { BaseResponseDto } from 'src/common/dto/success-response.dto';
import { NotificationResponseDto } from './dto/response/notification-response.dto';
import { RolesGuard } from '@/common/guards/roles.guard';
import { RolesDecorator } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/entities/user.entity';

@Controller({ path: 'notifications', scope: Scope.REQUEST })
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService,
        @Inject(REQUEST) private readonly request: AuthenticatedRequest,
    ) {}

    @Patch(':id/read')
    @RolesDecorator(Role.ADMIN, Role.DIREKSI, Role.GM, Role.SMS, Role.FREELANCER, Role.CLIENT)
    async markAsRead(@Param('id', ParseIntPipe) notificationId: number): Promise<BaseResponseDto<NotificationResponseDto>> {
        const notification = await this.notificationService.markAsRead(notificationId);
        return new BaseResponseDto(this.request, 'Notification marked as read', notification);
    }

    @Patch('read-all')
    @RolesDecorator(Role.ADMIN, Role.DIREKSI, Role.GM, Role.SMS, Role.FREELANCER, Role.CLIENT)
    async markAllAsRead(): Promise<BaseResponseDto<{ success: boolean; count: number }>> {
        const result = await this.notificationService.markAllAsRead();
        return new BaseResponseDto(this.request, 'All notifications marked as read', result);
    }

    @Get()
    @RolesDecorator(Role.ADMIN, Role.DIREKSI, Role.GM, Role.SMS, Role.FREELANCER, Role.CLIENT)
    async getMyNotifications(): Promise<BaseResponseDto<NotificationResponseDto[]>> {
        const notifications = await this.notificationService.getNotificationsForUser();
        return new BaseResponseDto(this.request, 'Notifications retrieved successfully', notifications);
    }
}
