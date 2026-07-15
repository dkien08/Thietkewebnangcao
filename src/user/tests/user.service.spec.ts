import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "../user.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../user.entity";
import { JwtService } from "@nestjs/jwt";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { describe, beforeEach, it, expect, jest } from "@jest/globals";

// Giả lập (mock) thư viện bcrypt để kiểm soát hoàn toàn việc mã hóa/so khớp mật khẩu
jest.mock("bcrypt", () => ({
  genSalt: jest.fn().mockImplementation(() => Promise.resolve("salt")),
  hash: jest.fn().mockImplementation(() => Promise.resolve("hashedpassword")),
  compare: jest.fn(),
}));

describe("UserService", () => {
  let service: UserService;
  let mockUserRepository: any;
  let mockJwtService: any;

  const mockUserRepositoryFactory = () => ({
    findOne: jest.fn(),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest
      .fn()
      .mockImplementation((user: any) => Promise.resolve({ id: 1, ...user })),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepositoryFactory,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue("mocked_jwt_token"),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    mockUserRepository = module.get(getRepositoryToken(User));
    mockJwtService = module.get<JwtService>(JwtService);
  });

  // ==========================================
  // 1. TEST CHỨC NĂNG FIND ONE
  // ==========================================
  describe("findOne", () => {
    it("nên trả về thông tin user (không kèm password) nếu tìm thấy ID", async () => {
      const mockUser = {
        id: 1,
        username: "kien",
        password: "hashedpassword",
        phone: "0123456789",
        role: "Tenant",
        currentMode: "Tenant",
      };
      mockUserRepository.findOne.mockReturnValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toBeDefined();
      expect(result.id).toEqual(1);
      expect((result as any).password).toBeUndefined();
    });

    it("nên ném ra lỗi NotFoundException nếu không tìm thấy ID", async () => {
      mockUserRepository.findOne.mockReturnValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================================
  // 2. TEST CHỨC NĂNG REGISTER
  // ==========================================
  describe("register", () => {
    it("nên đăng ký thành công nếu dữ liệu hợp lệ", async () => {
      const registerDto = {
        username: "newuser",
        password: "password123",
        phone: "0987654321",
        role: "Tenant",
      };

      mockUserRepository.findOne.mockReturnValue(null);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty("message", "Đăng ký thành công");
      expect(result.user).toBeDefined();
      expect(result.user.username).toEqual("newuser");
      expect((result.user as any).password).toBeUndefined();
    });

    it("nên ném lỗi BadRequestException nếu username đã tồn tại", async () => {
      const registerDto = {
        username: "existinguser",
        password: "password123",
        phone: "0987654321",
      };

      mockUserRepository.findOne.mockReturnValue({
        id: 1,
        username: "existinguser",
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ==========================================
  // 3. TEST CHỨC NĂNG LOGIN
  // ==========================================
  describe("login", () => {
    const loginDto = { username: "kien", password: "password123" };

    it("nên đăng nhập thành công và trả về accessToken nếu thông tin chính xác", async () => {
      const mockUser = {
        id: 1,
        username: "kien",
        password: "hashedpassword",
        role: "Tenant",
        currentMode: "Tenant",
        phone: "0123456789",
      };
      mockUserRepository.findOne.mockReturnValue(mockUser);

      (bcrypt.compare as jest.Mock).mockImplementation(() => Promise.resolve(true));

      const result = await service.login(loginDto);

      expect(result).toHaveProperty("message", "Đăng nhập thành công");
      expect(result).toHaveProperty("accessToken", "mocked_jwt_token");
      expect(result.user.username).toEqual("kien");
    });

    it("nên ném lỗi UnauthorizedException nếu username không tồn tại", async () => {
      mockUserRepository.findOne.mockReturnValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("nên ném lỗi UnauthorizedException nếu sai mật khẩu", async () => {
      const mockUser = { id: 1, username: "kien", password: "hashedpassword" };
      mockUserRepository.findOne.mockReturnValue(mockUser);

      (bcrypt.compare as jest.Mock).mockImplementation(() => Promise.resolve(false));

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ==========================================
  // 4. TEST CHỨC NĂNG SWITCH MODE
  // ==========================================
  describe("switchMode", () => {
    it("nên chuyển sang Landlord nếu currentMode đang là Tenant", async () => {
      const mockUser = { id: 1, username: "kien", currentMode: "Tenant" };
      mockUserRepository.findOne.mockReturnValue(mockUser);
      mockUserRepository.save.mockImplementation((u: any) => Promise.resolve(u));

      const result = await service.switchMode(1);

      expect(result.currentMode).toEqual("Landlord");
      expect(result.message).toContain("Đã chuyển sang chế độ Chủ nhà");
    });

    it("nên chuyển sang Tenant nếu currentMode đang là Landlord", async () => {
      const mockUser = { id: 1, username: "kien", currentMode: "Landlord" };
      mockUserRepository.findOne.mockReturnValue(mockUser);
      mockUserRepository.save.mockImplementation((u: any) => Promise.resolve(u));

      const result = await service.switchMode(1);

      expect(result.currentMode).toEqual("Tenant");
      expect(result.message).toContain("Đã chuyển sang chế độ Người thuê");
    });

    it("nên ném lỗi NotFoundException nếu không tìm thấy người dùng", async () => {
      mockUserRepository.findOne.mockReturnValue(null);

      await expect(service.switchMode(99)).rejects.toThrow(NotFoundException);
    });
  });
});