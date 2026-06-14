import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Đăng ký dòng này để kích hoạt Repository cho User
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}