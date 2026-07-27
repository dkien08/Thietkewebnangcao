import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { join } from "path";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. Cấu hình CORS (Phản hồi lại đúng Origin để hoạt động tốt với credentials: true)
  app.enableCors({
    origin: (origin, callback) => {
      // Cho phép tất cả request (kể cả Preflight OPTIONS) từ Codespaces & Localhost
      callback(null, true);
    },
    credentials: true, // Cho phép đính kèm Cookie/Header Authorization
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

  app.use(cookieParser());

  // 2. Cấu hình Helmet cho phép chia sẻ tài nguyên cross-origin (ảnh, media)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  // 3. Prefix API chung
  app.setGlobalPrefix("api");

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port, "0.0.0.0");

  console.log(`🚀 Server đang chạy tại: http://localhost:${port}/api`);
}
bootstrap();
