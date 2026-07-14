import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule} from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User]),
  JwtModule.register({
    secret:'Kienduc',
    signOptions:{expiresIn:'1h'},
  }),
],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}