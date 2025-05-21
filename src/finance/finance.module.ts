import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/common/entities/project.entity';
import { User } from 'src/common/entities/user.entity';
import AssignedRoles from 'src/common/entities/assignedRoles.entity';
import { Commission } from 'src/common/entities/commission.entity';
import { UserModule } from 'src/user/user.module';
import { ProjectModule } from 'src/project/project.module';
import { NotificationModule } from '@/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, User, AssignedRoles, Commission]), UserModule, ProjectModule, NotificationModule  // Add Project here
  ],
  controllers: [FinanceController],
  providers: [FinanceService]
})
export class FinanceModule {}
