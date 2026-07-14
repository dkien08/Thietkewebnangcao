import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Khởi tạo ứng dụng NestJS từ AppModule gốc
  const app = await NestFactory.create(AppModule);

  // Bật CORS để nếu sau này có làm giao diện (Frontend) gọi API sẽ không bị chặn
  app.enableCors();

  // Cấu hình tiền tố cho toàn bộ API (Ví dụ: http://localhost:3000/api/users)
  app.setGlobalPrefix('api');

  // Chạy server trên cổng 3000 (hoặc cổng cấu hình trong file .env)
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Server đang chạy mượt mà tại: http://localhost:${port}/api`);
}
bootstrap();