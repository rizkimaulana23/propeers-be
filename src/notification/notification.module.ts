import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../common/entities/notification.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { User } from 'src/common/entities/user.entity';
import { Content } from 'src/common/entities/content.entity'; // Import Content entity
import { Project } from 'src/common/entities/project.entity'; // Import Project entity
import AssignedRoles from 'src/common/entities/assignedRoles.entity'; // Import AssignedRoles entity

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification, User, Content, Project, AssignedRoles]), // Add Content, Project, AssignedRoles
    ],
    providers: [NotificationService],
    controllers: [NotificationController],
    exports: [NotificationService], // Export service for use in other modules
})
export class NotificationModule {}
