import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { User } from './user/user.entity';
import { ContractModule } from './contract/contract.module';

import { Room } from './rooms/room.entity';
import { RoomModule } from './rooms/room.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('DB_HOST')
        const port = configService.get<number>('DB_PORT')
        const username = configService.get<string>('DB_USER')
        const password = configService.get<string>('DB_PASSWORD')
        const database = configService.get<string>('DB_NAME')

        console.log('🔌 Đang kết nối tới Host:', host);
        console.log('👤 Sử dụng Username:', username);

        return {
          type: 'mysql',
          host: host,
          port: port,
          username: username,
          password: password,
          database: database,
          entities: [User, Room],
          synchronize: false,
          logging: true,
          retryAttempts: 2,
          retryDelay: 3000,
          connectTimeout: 30000,

          ssl: {
            rejectUnauthorized: false,
          },
        };
      },
    }),

    UserModule,
    ContractModule,
    RoomModule,
  ],
})
export class AppModule { }