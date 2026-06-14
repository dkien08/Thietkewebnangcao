import { Module } from '@nestjs/common';
import { Module as NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { User } from './user/user.entity';

@NestModule({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Đọc giá trị từ .env, nếu trống thì tự động điền giá trị chuẩn của Aiven
        const host = configService.get<string>('DB_HOST') || 'thietkeweb-quizz.l.aivencloud.com';
        const port = configService.get<number>('DB_PORT') || 13982;
        const username = configService.get<string>('DB_USERNAME') || 'avnadmin'; // Tự vá nếu bị undefined
        const password = configService.get<string>('DB_PASSWORD');
        const database = configService.get<string>('DB_NAME') || 'defaultdb';

        console.log('🔌 Kết nối tới Host:', host);
        console.log('👤 Sử dụng Username:', username);

        return {
          type: 'mysql',
          host: host,
          port: port,
          username: username,
          password: password,
          database: database,
          entities: [User],
          synchronize: false,
          logging: true,
          ssl: {
            rejectUnauthorized: false,
          },
        };
      },
    }),
    
    UserModule,
  ],
})
export class AppModule {}