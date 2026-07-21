import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportService } from './report.service';
import { Room } from '../room/room.entity';
import { Contract } from '../contract/contract.entity';

describe('ReportService', () => {
  let service: ReportService;
  let roomRepository: Repository<Room>;
  let contractRepository: Repository<Contract>;

  // Tạo mock QueryBuilder cho Room
  const mockRoomQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  // Tạo mock QueryBuilder cho Contract
  const mockContractQueryBuilder = {
    innerJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  const mockRoomRepository = {
    createQueryBuilder: jest.fn(() => mockRoomQueryBuilder),
  };

  const mockContractRepository = {
    createQueryBuilder: jest.fn(() => mockContractQueryBuilder),
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
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
    roomRepository = module.get<Repository<Room>>(getRepositoryToken(Room));
    contractRepository = module.get<Repository<Contract>>(getRepositoryToken(Contract));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLandlordReport', () => {
    it('nên tính toán đúng tổng số phòng, tỷ lệ thuê và doanh thu dự kiến', async () => {
      const landlordId = 1;

      // Giả lập tổng số phòng của chủ nhà = 5
      // Giả lập số phòng đã thuê = 2
      mockRoomQueryBuilder.getRawOne
        .mockResolvedValueOnce({ count: '5' })  // Lần gọi 1: COUNT tổng phòng
        .mockResolvedValueOnce({ count: '2' }); // Lần gọi 2: COUNT phòng đã thuê

      // Giả lập tổng tiền thuê từ các hợp đồng active = 5000000.00
      mockContractQueryBuilder.getRawOne.mockResolvedValueOnce({ total: '5000000.00' });

      const result = await service.getLandlordReport(landlordId);

      expect(roomRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
      expect(contractRepository.createQueryBuilder).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        landlordId: 1,
        totalRooms: 5,
        rentedRooms: 2,
        rentalRate: '40%', // (2/5) * 100 = 40
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
});