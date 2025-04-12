import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ContentModule } from 'src/content/content.module';
import { ProjectModule } from 'src/project/project.module';
import { TalentModule } from 'src/talent/talent.module';
import { UserModule } from 'src/user/user.module';
import { FinanceModule } from 'src/finance/finance.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/common/entities/project.entity';
import { Content } from 'src/common/entities/content.entity';
import AssignedRoles from 'src/common/entities/assignedRoles.entity';
import { User } from 'src/common/entities/user.entity';
import { Commission } from 'src/common/entities/commission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project, Content, AssignedRoles, User, Commission
    ]),
    ContentModule,
    FinanceModule,
    ProjectModule,
    TalentModule,
    UserModule
  ],
  providers: [DashboardService],
  controllers: [DashboardController]
})
export class DashboardModule {}
