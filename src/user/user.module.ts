import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/common/entities/user.entity';
import { Speciality } from 'src/common/entities/speciality.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, Speciality
    ])
  ],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule {}
