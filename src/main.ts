import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";
import helmet from 'helmet';

async function bootstrap() {
  // Khởi tạo ứng dụng NestJS từ AppModule gốc
  const app = await NestFactory.create(AppModule);

  // Bật CORS để nếu sau này có làm giao diện (Frontend) gọi API sẽ không bị chặn
  app.enableCors();

  app.use(cookieParser());

  app.use(helmet());

  app.setGlobalPrefix("api");

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Server đang chạy tại: http://localhost:${port}/api`);
}
bootstrap();
