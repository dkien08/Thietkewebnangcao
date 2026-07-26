import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportService } from './report.service';
import { Room } from '../room/room.entity';
import { Contract } from '../contract/contract.entity';
import { User } from '../user/user.entity'; // Import thêm User Entity cho Admin report

describe('ReportService', () => {
  let service: ReportService;
  let roomRepository: Repository<Room>;
  let contractRepository: Repository<Contract>;
  let userRepository: Repository<User>;

  // Mock QueryBuilder cho Room
  const mockRoomQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  // Mock QueryBuilder cho Contract
  const mockContractQueryBuilder = {
    innerJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  const mockRoomRepository = {
    createQueryBuilder: jest.fn(() => mockRoomQueryBuilder),
    count: jest.fn(),
  };

  const mockContractRepository = {
    createQueryBuilder: jest.fn(() => mockContractQueryBuilder),
    count: jest.fn(),
  };

  const mockUserRepository = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        {
          provide: getRepositoryToken(Room),
          useValue: mockRoomRepository,
        },
        {
          provide: getRepositoryToken(Contract),
          useValue: mockContractRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
    roomRepository = module.get<Repository<Room>>(getRepositoryToken(Room));
    contractRepository = module.get<Repository<Contract>>(getRepositoryToken(Contract));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // 1. TEST SUITE DÀNH CHO LANDLORD REPORT
  // ==========================================
  describe('getLandlordReport', () => {
    it('nên tính toán đúng tổng số phòng, tỷ lệ thuê và doanh thu dự kiến', async () => {
      const landlordId = 1;

      mockRoomQueryBuilder.getRawOne
        .mockResolvedValueOnce({ count: '5' })  // Tổng số phòng
        .mockResolvedValueOnce({ count: '2' }); // Phòng đã thuê

      mockContractQueryBuilder.getRawOne.mockResolvedValueOnce({ total: '5000000.00' });

      const result = await service.getLandlordReport(landlordId);

      expect(roomRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
      expect(contractRepository.createQueryBuilder).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        landlordId: 1,
        totalRooms: 5,
        rentedRooms: 2,
        rentalRate: '40%',
        expectedMonthlyRevenue: 5000000,
      });
    });

    it('nên trả về tỷ lệ 0% và doanh thu 0 nếu chủ nhà không có phòng trọ nào', async () => {
      const landlordId = 1;

      mockRoomQueryBuilder.getRawOne
        .mockResolvedValueOnce({ count: '0' })
        .mockResolvedValueOnce({ count: '0' });

      mockContractQueryBuilder.getRawOne.mockResolvedValueOnce({ total: null });

      const result = await service.getLandlordReport(landlordId);

      expect(result).toEqual({
        landlordId: 1,
        totalRooms: 0,
        rentedRooms: 0,
        rentalRate: '0%',
        expectedMonthlyRevenue: 0,
      });
    });
  });

  // ==========================================
  // 2. BỔ SUNG: TEST SUITE DÀNH CHO ADMIN REPORT
  // ==========================================
  describe('getAdminReport', () => {
    it('nên trả về thống kê tổng quan toàn bộ hệ thống cho Admin', async () => {
      // Giả lập dữ liệu tổng quan hệ thống
      mockUserRepository.count.mockResolvedValue(100);       // 100 người dùng
      mockRoomRepository.count.mockResolvedValue(50);         // 50 phòng trọ
      mockContractRepository.count.mockResolvedValue(20);     // 20 hợp đồng đang active

      const result = await service.getAdminReport();

      expect(userRepository.count).toHaveBeenCalledTimes(1);
      expect(roomRepository.count).toHaveBeenCalledTimes(1);
      expect(contractRepository.count).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        totalUsers: 100,
        totalRooms: 50,
        activeContracts: 20,
      });
    });
  });
});