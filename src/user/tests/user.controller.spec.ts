import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    findOne: jest.fn(),
    update: jest.fn(),
    switchMode: jest.fn(),
    findAll: jest.fn(),
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
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('F03: getProfile', () => {
    it('should return user profile based on req.user.sub', async () => {
      const req = { user: { sub: 1 } }; 
      const expectedUser = { id: 1, name: 'Kiên', email: 'kien@example.com', role: 'Tenant' };

      mockUserService.findOne.mockResolvedValue(expectedUser);

      const result = await controller.getProfile(req);

      expect(result).toEqual(expectedUser);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('F03.1: updateProfile', () => {
    it('should update user profile successfully', async () => {
      const req = { user: { sub: 1 } };
      const updateDto = { phone: '0987654321' } as any;
      const expectedResult = { id: 1, phone: '0987654321' };

      mockUserService.update.mockResolvedValue(expectedResult);

      const result = await controller.updateProfile(req, updateDto);

      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('F03.2: switchMode', () => {
    it('should switch role between Tenant and Landlord', async () => {
      const req = { user: { sub: 1 } };
      const expectedResult = { id: 1, role: 'Landlord' };

      mockUserService.switchMode.mockResolvedValue(expectedResult);

      const result = await controller.switchMode(req);

      expect(result).toEqual(expectedResult);
      expect(service.switchMode).toHaveBeenCalledWith(1);
    });
  });
});