import { Module } from '@nestjs/common';
import { TalentService } from './talent.service';
import { TalentController } from './talent.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/common/entities/project.entity';
import { User } from 'src/common/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import AssignedRoles from 'src/common/entities/assignedRoles.entity';
import { NotificationModule } from '@/notification/notification.module';
import { Submission } from '@/common/entities/submission.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
          Project, User, AssignedRoles, Submission
        ]),
        NotificationModule, 
        UserModule
      ],
    controllers: [TalentController],
    providers: [TalentService],
})
export class TalentModule {}