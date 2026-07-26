import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";
import helmet from "helmet";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Cấu hình CORS (Phản hồi lại đúng Origin để hoạt động tốt với credentials: true)
  app.enableCors({
    origin: (origin, callback) => {
      // Cho phép request không có origin (like mobile apps/postman) hoặc đúng domain
      if (
        !origin ||
        origin.includes("app.github.dev") ||
        origin.includes("localhost")
      ) {
        callback(null, true);
      } else {
        callback(null, true); // Chấp nhận tất cả domain gửi kèm credentials
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
    allowedHeaders: "Content-Type, Accept, Authorization",
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

  const port = process.env.PORT || 3001;
  await app.listen(port, "0.0.0.0");

  console.log(`🚀 Server đang chạy tại: http://localhost:${port}/api`);
}
bootstrap();
