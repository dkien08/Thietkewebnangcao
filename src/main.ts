import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Cấu hình CORS (Phản hồi lại đúng Origin để hoạt động tốt với credentials: true)
  app.enableCors({
    origin: (origin, callback) => {
      // Cho phép tất cả request (Localhost, Codespaces, Postman)
      callback(null, origin || true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.use(cookieParser());

  // 2. Cấu hình Helmet cho phép chia sẻ tài nguyên cross-origin (ảnh, media)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  // 3. Prefix API chung
  app.setGlobalPrefix("api");

  // 4. Đồng bộ Port 3000 với Frontend
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server đang chạy tại: http://localhost:${port}/api`);
}
bootstrap();