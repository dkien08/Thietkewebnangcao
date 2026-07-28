import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  // Mock UserService bao gồm đầy đủ các hàm được controller sử dụng
  const mockUserService = {
    findOne: jest.fn(),
    update: jest.fn(),
    switchMode: jest.fn(),
    findAll: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      // Override Guard để tránh bị bắt Auth/Admin khi gọi handler trực tiếp
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- USER PROFILE ENDPOINTS ---

  describe('getProfile', () => {
    it('should return profile using req.user.sub', async () => {
      const req = { user: { sub: 1 } };
      const expectedUser = { id: 1, username: 'testuser', phone: '0987654321' };

      mockUserService.findOne.mockResolvedValue(expectedUser);

      const result = await controller.getProfile(req);

      expect(result).toEqual(expectedUser);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should fallback to req.user.userId or req.user.id if sub is missing', async () => {
      const reqUserId = { user: { userId: 2 } };
      const reqId = { user: { id: 3 } };

      mockUserService.findOne.mockResolvedValue({ id: 2 });
      await controller.getProfile(reqUserId);
      expect(service.findOne).toHaveBeenCalledWith(2);

      mockUserService.findOne.mockResolvedValue({ id: 3 });
      await controller.getProfile(reqId);
      expect(service.findOne).toHaveBeenCalledWith(3);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile using JWT payload user id', async () => {
      const req = { user: { sub: 1 } };
      const updateDto: UpdateUserDto = { phone: '0987654321' };
      const expectedResult = { id: 1, phone: '0987654321' };

      mockUserService.update.mockResolvedValue(expectedResult);

      const result = await controller.updateProfile(req, updateDto);

      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('switchMode', () => {
    it('should call service.switchMode with user id from req', async () => {
      const req = { user: { sub: 1 } };
      const expectedResult = { id: 1, role: 'Landlord' };

      mockUserService.switchMode.mockResolvedValue(expectedResult);

      const result = await controller.switchMode(req);

      expect(result).toEqual(expectedResult);
      expect(service.switchMode).toHaveBeenCalledWith(1);
    });
  });

  // --- ADMIN ENDPOINTS ---

  describe('findAll (Admin)', () => {
    it('should return an array of users', async () => {
      const expectedUsers = [
        { id: 1, username: 'user1' },
        { id: 2, username: 'user2' },
      ];

      mockUserService.findAll.mockResolvedValue(expectedUsers);

      const result = await controller.findAll();

      expect(result).toEqual(expectedUsers);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne (Admin)', () => {
    it('should return a user by id', async () => {
      const targetId = 5;
      const expectedUser = { id: 5, username: 'admin_user' };

      mockUserService.findOne.mockResolvedValue(expectedUser);

      const result = await controller.findOne(targetId);

      expect(result).toEqual(expectedUser);
      expect(service.findOne).toHaveBeenCalledWith(targetId);
    });
  });

  describe('update (Admin)', () => {
    it('should update any user by param id', async () => {
      const targetId = 2;
      const updateDto: UpdateUserDto = { phone: '0123456789' };
      const expectedResult = { id: 2, phone: '0123456789' };

      mockUserService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(targetId, updateDto);

      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(targetId, updateDto);
    });
  });

  describe('remove (Admin)', () => {
    it('should remove a user by id', async () => {
      const targetId = 3;
      const expectedResponse = { message: 'User deleted successfully' };

      mockUserService.remove.mockResolvedValue(expectedResponse);

      const result = await controller.remove(targetId);

      expect(result).toEqual(expectedResponse);
      expect(service.remove).toHaveBeenCalledWith(targetId);
    });
  });
});