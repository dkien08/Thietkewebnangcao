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

jest.mock("bcrypt", () => ({
  genSalt: jest.fn().mockImplementation(() => Promise.resolve("salt")),
  hash: jest.fn().mockImplementation(() => Promise.resolve("hashedpassword")),
  compare: jest.fn(),
}));

describe("UserService", () => {
  let service: UserService;
  let mockUserRepository: any;

  const mockUserRepositoryFactory = () => ({
    findOne: jest.fn(),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((user: any) => Promise.resolve({ id: 1, ...user })),
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
  });

  // ==========================================
  // 1. TEST CHỨC NĂNG FIND ONE
  // ==========================================
  describe("findOne", () => {
    it("nên trả về thông tin user nếu tìm thấy ID", async () => {
      const mockUser = { id: 1, username: "kien", password: "hashedpassword", phone: "0123456789", role: "Tenant" };
      mockUserRepository.findOne.mockReturnValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toBeDefined();
      expect(result.id).toEqual(1);
      expect(result.password).toEqual("hashedpassword"); // Đúng bản chất hàm findOne thật
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
      const registerDto = { username: "newuser", password: "password123", phone: "0987654321", role: "Tenant" };
      mockUserRepository.findOne.mockReturnValue(null);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty("message", "Đăng ký thành công");
      expect(result.user).toBeDefined();
      expect(result.user.username).toEqual("newuser");
    });
  });

  // ==========================================
  // 3. TEST CHỨC NĂNG SWITCH MODE (Đồng bộ theo trường ROLE thật)
  // ==========================================
  describe("switchMode", () => {
    it("nên chuyển sang Landlord nếu role đang là Tenant", async () => {
      const mockUser = { id: 1, username: "kien", role: "Tenant" };
      mockUserRepository.findOne.mockReturnValue(mockUser);

      const result = await service.switchMode(1);

      expect(result.currentRole).toEqual("Landlord");
      expect(result.message).toContain("Chuyển đổi sang vai trò Landlord thành công");
    });

    it("nên chuyển sang Tenant nếu role đang là Landlord", async () => {
      const mockUser = { id: 1, username: "kien", role: "Landlord" };
      mockUserRepository.findOne.mockReturnValue(mockUser);

      const result = await service.switchMode(1);

      expect(result.currentRole).toEqual("Tenant");
      expect(result.message).toContain("Chuyển đổi sang vai trò Tenant thành công");
    });

    it("nên ném lỗi BadRequestException nếu cố tình switchMode tài khoản Admin", async () => {
      const mockUser = { id: 1, username: "admin", role: "Admin" };
      mockUserRepository.findOne.mockReturnValue(mockUser);

      await expect(service.switchMode(1)).rejects.toThrow(BadRequestException);
    });
  });
});