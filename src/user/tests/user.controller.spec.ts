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

describe("UserController (Rate Limiting & Logic)", () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let mockUserService: any;

  beforeEach(async () => {
    mockUserService = {
      register: jest.fn(() => 
        Promise.resolve({ message: "Đăng ký thành công" })
      ),
      login: jest.fn(() => 
        Promise.resolve({ message: "Đăng nhập thành công", accessToken: "mock_token" })
      ),
      findOne: jest.fn(() => 
        Promise.resolve({ id: 1, username: "kien" })
      ),
      update: jest.fn(() => 
        Promise.resolve({ id: 1, username: "kien" })
      ),
      switchMode: jest.fn(() => 
        Promise.resolve({ message: "Chuyển đổi vai trò thành công" })
      ),
      changePassword: jest.fn(() => 
        Promise.resolve({ message: "Đổi mật khẩu thành công!" })
      ),
    };

    moduleFixture = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            name: "default",
            ttl: 60000,
            limit: 5, // Đồng bộ với giới hạn của Controller thật
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
      const testIp = "127.0.0.2"; 

      let response: any;

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

  // ==========================================
  // BỔ SUNG: TEST LOGIC XÁC THỰC BIẾN SUB
  // ==========================================
  describe("Auth Logic & Dữ liệu", () => {
    it("API Profile nên đọc đúng biến sub từ req.user để tìm kiếm trong DB", async () => {
      // Giả lập cấu trúc payload chuẩn do JwtStrategy giải mã từ token thật
      const mockUserPayload = { sub: 24100323, username: "kien" };
      
      const controller = moduleFixture.get<UserController>(UserController);

      await controller.getProfile({ user: mockUserPayload });
      expect(mockUserService.findOne).toHaveBeenCalledWith(24100323);
    });

    it("API Switch Mode nên đọc đúng biến sub từ req.user để xử lý", async () => {
      const mockUserPayload = { sub: 24100323, username: "kien" };
      const controller = moduleFixture.get<UserController>(UserController);
      
      await controller.switchMode({ user: mockUserPayload });

      expect(mockUserService.switchMode).toHaveBeenCalledWith(24100323);
    });
  });
});