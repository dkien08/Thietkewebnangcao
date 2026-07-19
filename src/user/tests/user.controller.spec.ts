import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "../user.controller";
import { UserService } from "../user.service";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import {
  describe,
  beforeEach,
  afterEach,
  it,
  expect,
  jest,
} from "@jest/globals";

// Khoảng nghỉ siêu nhỏ để bộ nhớ RAM ảo của Throttler kịp lưu hit count
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Định nghĩa một Guard tùy chỉnh ép đọc Header để test nhận diện đúng IP khác nhau
class TestThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Ưu tiên đọc header 'x-forwarded-for' do ta giả lập bằng supertest
    const forwarded = req.headers["x-forwarded-for"];
    return forwarded
      ? Array.isArray(forwarded)
        ? forwarded[0]
        : forwarded
      : req.ip;
  }
}

describe("UserController (Rate Limiting)", () => {
  let app: INestApplication;
  let mockUserService: any;

  beforeEach(async () => {
    mockUserService = {
      register: jest
        .fn()
        .mockResolvedValue({
          message: "Đăng ký thành công",
        } as unknown as never),
      login: jest
        .fn()
        .mockResolvedValue({
          message: "Đăng nhập thành công",
        } as unknown as never),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            name: "default",
            ttl: 60000,
            limit: 5, // Đặt thẳng bằng 5 cho đồng bộ với Controller thật
          },
        ]),
      ],
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: APP_GUARD,
          useClass: TestThrottlerGuard,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Bật trust proxy để Express nhận diện IP giả lập từ Header X-Forwarded-For
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.set("trust proxy", true);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  // ==========================================
  // TEST GIỚI HẠN TẦN SUẤT (RATE LIMIT)
  // ==========================================
  describe("Rate Limiting", () => {
    it("nên cho phép gửi request bình thường nếu dưới ngưỡng giới hạn", async () => {
      const registerDto = {
        username: "kientest",
        password: "password123",
        phone: "0987654321",
      };
      const testIp = "127.0.0.1";

      // Chỉ gửi 1 lần duy nhất để chắc chắn pass qua limit
      await request(app.getHttpServer())
        .post("/auth/register")
        .set("X-Forwarded-For", testIp)
        .send(registerDto)
        .expect(201);
    });

    it("nên chặn đứng request khi vượt quá giới hạn và trả về mã lỗi HTTP 429", async () => {
      const loginDto = {
        username: "kientest",
        password: "password123",
      };
      const testIp = "127.0.0.2"; // Dùng IP riêng biệt

      let response: any;

      // 👉 GIẢI PHÁP THÔNG MINH:
      for (let i = 0; i < 6; i++) {
        response = await request(app.getHttpServer())
          .post("/auth/login")
          .set("X-Forwarded-For", testIp)
          .send(loginDto);

        await delay(50);
      }
      expect(response.status).toBe(429);
      expect(response.body.message).toMatch(/Too Many Requests|Throttler/i);
    });
  });
});
