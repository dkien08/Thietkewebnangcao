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

// Mock module bcrypt
jest.mock("bcrypt", () => ({
  genSalt: jest.fn().mockResolvedValue("salt"),
  hash: jest.fn().mockResolvedValue("hashedpassword"),
  compare: jest.fn(),
}));

describe("UserService", () => {
  let service: UserService;
  let mockUserRepository: any;
  let mockJwtService: any;

  const mockUserRepositoryFactory = () => ({
    findOne: jest.fn(),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((user: any) => Promise.resolve({ id: 1, ...user })),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  });

  beforeEach(async () => {
    mockJwtService = {
      sign: jest.fn().mockReturnValue("mocked_jwt_token"),
      signAsync: jest.fn().mockResolvedValue("mocked_jwt_token_async"),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepositoryFactory,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    mockUserRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // ==========================================
  // 1. TEST CHỨC NĂNG FIND ONE
  // ==========================================
  describe("findOne", () => {
    it("nên trả về thông tin user nếu tìm thấy ID", async () => {
      const mockUser = { id: 1, username: "kien", password: "hashedpassword", phone: "0123456789", role: "Tenant" };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toBeDefined();
      expect(result.id).toEqual(1);
      expect(result.password).toEqual("hashedpassword");
    });

    it("nên ném ra lỗi NotFoundException nếu không tìm thấy ID", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================================
  // 2. TEST CHỨC NĂNG REGISTER
  // ==========================================
  describe("register", () => {
    it("nên đăng ký thành công nếu dữ liệu hợp lệ", async () => {
      const registerDto = { username: "newuser", password: "password123", phone: "0987654321", role: "Tenant" };
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty("message", "Đăng ký thành công");
      expect(result.user).toBeDefined();
      expect(result.user.username).toEqual("newuser");
      expect(result.user.password).toBeUndefined(); // Đã bị delete password
    });

    it("nên ném ra lỗi BadRequestException nếu username đã tồn tại", async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1, username: "existinguser" });

      await expect(
        service.register({ username: "existinguser", password: "123" })
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ==========================================
  // 3. TEST CHỨC NĂNG LOGIN
  // ==========================================
  describe("login", () => {
    it("nên ném ra BadRequestException nếu thiếu thông tin đăng nhập", async () => {
      await expect(service.login({ username: "" })).rejects.toThrow(BadRequestException);
    });

    it("nên ném ra UnauthorizedException nếu không tìm thấy user hoặc sai mật khẩu", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.login({ username: "wrong", password: "123" })).rejects.toThrow(UnauthorizedException);

      const mockUser = { id: 1, username: "kien", password: "hashedpassword" };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ username: "kien", password: "wrongpassword" })).rejects.toThrow(UnauthorizedException);
    });

    it("nên đăng nhập thành công và trả về accessToken", async () => {
      const mockUser = { id: 1, username: "kien", password: "hashedpassword", role: "Tenant", phone: "0123456789" };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ username: "kien", password: "correctpassword" });

      expect(result.message).toEqual("Đăng nhập thành công");
      expect(result.accessToken).toEqual("mocked_jwt_token_async");
      expect(result.user.id).toEqual(1);
    });
  });

  // ==========================================
  // 4. TEST CHỨC NĂNG SWITCH MODE
  // ==========================================
  describe("switchMode", () => {
    it("nên ném ra BadRequestException nếu không tìm thấy user", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.switchMode(99)).rejects.toThrow(BadRequestException);
    });

    it("nên tự động toggle từ Tenant sang Landlord nếu không truyền newMode", async () => {
      const mockUser = { id: 1, username: "kien", currentMode: "Tenant", role: "Tenant" };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.switchMode(1);

      expect(result.currentMode).toEqual("Landlord");
      expect(result.message).toContain("Chuyển đổi sang vai trò Landlord thành công");
      expect(result.accessToken).toEqual("mocked_jwt_token");
    });

    it("nên tự động toggle từ Landlord sang Tenant nếu không truyền newMode", async () => {
      const mockUser = { id: 1, username: "kien", currentMode: "Landlord", role: "Tenant" };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.switchMode(1);

      expect(result.currentMode).toEqual("Tenant");
      expect(result.message).toContain("Chuyển đổi sang vai trò Tenant thành công");
    });

    it("nên gán đúng newMode nếu được truyền trực tiếp vào", async () => {
      const mockUser = { id: 1, username: "kien", currentMode: "Tenant", role: "Tenant" };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.switchMode(1, "Landlord");

      expect(result.currentMode).toEqual("Landlord");
    });
  });

  // ==========================================
  // 5. TEST CHỨC NĂNG CHANGE PASSWORD
  // ==========================================
  describe("changePassword", () => {
    it("nên ném ra BadRequestException nếu mật khẩu cũ sai", async () => {
      const mockUser = { id: 1, password: "hashedpassword" };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(1, { oldPassword: "wrong", newPassword: "new" })
      ).rejects.toThrow(BadRequestException);
    });

    it("nên đổi mật khẩu thành công nếu thông tin chính xác", async () => {
      const mockUser = { id: 1, password: "oldhashedpassword" };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.changePassword(1, {
        oldPassword: "correctOldPassword",
        newPassword: "newPassword123",
      });

      expect(result.message).toEqual("Đổi mật khẩu thành công!");
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });
});