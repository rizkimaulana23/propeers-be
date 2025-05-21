import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './common/entities/user.entity';
import { Project } from './common/entities/project.entity';
import { Speciality } from './common/entities/speciality.entity';
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
import { ContentModule } from './content/content.module';
import { Content } from './common/entities/content.entity';
import { SubmissionModule } from './submission/submission.module';
import { FinanceModule } from './finance/finance.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationModule } from './notification/notification.module';

const isProduction = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule,
        ScheduleModule.forRoot(),
      ],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: isProduction ? process.env.DATABASE_URL : undefined,
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [User, Project, Speciality, Content, ProjectReferences, Notification, Submission, Activity, Commission, AssignedRoles],
        synchronize: true,
        logging: false,
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),
    TypeOrmModule.forFeature([Speciality]),
    AuthModule,
    UserModule,
    ProjectModule,
    TalentModule,
    ContentModule,
    DashboardModule,
    SubmissionModule,
    FinanceModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
