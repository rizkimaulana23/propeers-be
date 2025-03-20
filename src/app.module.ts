import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './common/entities/user.entity';
import { Project } from './common/entities/project.entity';
import { Speciality } from './common/entities/speciality.entity';
import { ContentPlan } from './common/entities/contentPlan.entity';
import { Deliverable } from './common/entities/deliverables.entity';
import { ProjectReferences } from './common/entities/projectReferences.entity';
import { Notification } from './common/entities/notification.entity';
import { Submission } from './common/entities/submission.entity';
import { Activity } from './common/entities/activity.entity';
import { Commission } from './common/entities/commission.entity';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import AssignedRoles from './common/entities/assignedRoles.entity';
import { JwtModule } from '@nestjs/jwt';
import { ProjectModule } from './project/project.module';
import { TalentModule } from './talent/talent.module';
import { FinanceModule } from './finance/finance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [User, Project, Speciality, ContentPlan, Deliverable, ProjectReferences, Notification, Submission, Activity, Commission, AssignedRoles],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') !== 'production',
      }),
    }),
    AuthModule,
    UserModule,
    ProjectModule,
    TalentModule,
    FinanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
