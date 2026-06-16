import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { User } from './user/user.entity';
import { ContractModule } from './contract/contract.module';

// Đã sửa đường dẫn thành 'rooms' khớp với cấu trúc thư mục của bạn
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
        // Đọc chính xác cấu trúc biến từ file .env của bạn
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
          synchronize: false, // Không tự động sync làm ảnh hưởng database chung của nhóm
          logging: true,

          // Cấu hình chống nghẽn kết nối mạng đám mây
          retryAttempts: 2,
          retryDelay: 3000,
          connectTimeout: 30000, // Tăng lên 30 giây để đảm bảo kết nối tới Aiven Cloud ổn định

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