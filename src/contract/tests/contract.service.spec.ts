import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

import { ContractService } from '../contract.service';
import { Contract, ContractStatus } from '../contract.entity';
import { Room } from '../../room/room.entity';
import { CreateContractDto } from '../dto/contract.dto';

describe('ContractService', () => {
  let service: ContractService;

  const mockContractRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockRoomRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  // 🎯 Mock QueryRunner manager phục vụ cho Transaction trong approveContract
  const mockQueryRunnerManager = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: mockQueryRunnerManager, // 👈 Đã gắn manager có đủ findOne, save, update
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractService,
        {
          provide: getRepositoryToken(Contract),
          useValue: mockContractRepository,
        },
        {
          provide: getRepositoryToken(Room),
          useValue: mockRoomRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ContractService>(ContractService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createContract (F08 - Tenant tạo hợp đồng)', () => {
    const tenantId = 8;
    const dto: CreateContractDto = {
      roomId: 9,
      startDate: new Date('2026-08-01'),
      endDate: new Date('2027-08-01'),
    };

    it('1. Nên báo lỗi NotFoundException nếu không tìm thấy phòng trọ', async () => {
      mockRoomRepository.findOne.mockResolvedValue(null);

      await expect(service.createContract(tenantId, dto)).rejects.toThrow(NotFoundException);
    });

    it('2. Nên báo lỗi BadRequestException nếu Tenant đã có yêu cầu PENDING cho phòng này', async () => {
      // 🎯 Thêm status 'Available' vào mock room
      mockRoomRepository.findOne.mockResolvedValue({ id: 9, price: 3500000, status: 'Available' });
      mockContractRepository.findOne.mockResolvedValue({
        id: 1,
        tenantId,
        roomId: 9,
        status: ContractStatus.PENDING,
      });

      await expect(service.createContract(tenantId, dto)).rejects.toThrow(BadRequestException);
    });

    it('3. Nên tạo thành công hợp đồng mới nếu dữ liệu hợp lệ', async () => {
      // 🎯 Bổ sung status: 'Available' để vượt qua bước check room status
      const mockRoom = { id: 9, price: 3500000, status: 'Available' };
      const createdContract = {
        tenantId,
        roomId: dto.roomId,
        startDate: dto.startDate,
        endDate: dto.endDate,
        price: 3500000,
        status: ContractStatus.PENDING,
      };

      mockRoomRepository.findOne.mockResolvedValue(mockRoom);
      mockContractRepository.findOne.mockResolvedValue(null);
      mockContractRepository.create.mockReturnValue(createdContract);
      mockContractRepository.save.mockResolvedValue({ id: 1, ...createdContract });

      const result = await service.createContract(tenantId, dto);

      expect(result).toHaveProperty('id', 1);
      expect(result.status).toBe(ContractStatus.PENDING);
    });
  });

  describe('approveContract (F15 - Landlord duyệt hợp đồng)', () => {
    it('1. Nên báo lỗi ForbiddenException nếu người duyệt không phải chủ sở hữu phòng', async () => {
      const contractId = 1;
      const invalidLandlordId = 99;

      // 🎯 Mock queryRunner.manager.findOne để trả về hợp đồng với chủ sở hữu phòng là id = 2
      mockQueryRunnerManager.findOne.mockResolvedValue({
        id: contractId,
        room: { landlordId: 2 },
      });

      await expect(service.approveContract(contractId, invalidLandlordId)).rejects.toThrow(
        ForbiddenException,
      );

      // Đảm bảo transaction được rollback và release sạch sẻ
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });
});