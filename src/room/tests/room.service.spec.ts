import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

import { RoomService } from '../room.service';
import { Room } from '../room.entity';
import { RoomImage } from '../room-image.entity';
import { Contract, ContractStatus } from '../../contract/contract.entity';
import { Favourite } from '../../favourite/favourite.entity';

describe('RoomService', () => {
  let service: RoomService;
  let mockRoomRepository: any;
  let mockContractRepository: any;
  let mockFavouriteRepository: any;

  // Mock QueryBuilder cho TypeORM
  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
  };

  const mockRoomRepositoryFactory = () => ({
    create: jest.fn((dto) => dto),
    save: jest.fn((room) => Promise.resolve({ id: 1, ...room })),
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    remove: jest.fn((room) => Promise.resolve(room)),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    manager: {
      getRepository: jest.fn(),
    },
  });

  const mockContractRepositoryFactory = () => ({
    findOne: jest.fn().mockResolvedValue(null),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  });

  const mockFavouriteRepositoryFactory = () => ({
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        {
          provide: getRepositoryToken(Room),
          useFactory: mockRoomRepositoryFactory,
        },
        {
          provide: getRepositoryToken(Contract),
          useFactory: mockContractRepositoryFactory,
        },
        {
          provide: getRepositoryToken(Favourite),
          useFactory: mockFavouriteRepositoryFactory,
        },
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
    mockRoomRepository = module.get(getRepositoryToken(Room));
    mockContractRepository = module.get(getRepositoryToken(Contract));
    mockFavouriteRepository = module.get(getRepositoryToken(Favourite));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =========================================================================
  // [ZONE 1] CHỨC NĂNG CỦA LANDLORD (F10, F11, F12, F13)
  // =========================================================================
  describe('Landlord Management Zone', () => {
    // F10: Create Room
    describe('create (F10)', () => {
      it('nên tạo phòng mới thành công với landlordId kiểu number', async () => {
        const roomDto = { title: 'Phòng trọ cao cấp', price: 3000000 } as any;
        const landlordId = 24100323;

        const result = await service.create(roomDto, landlordId);

        expect(mockRoomRepository.create).toHaveBeenCalledWith({
          ...roomDto,
          landlordId,
        });
        expect(mockRoomRepository.save).toHaveBeenCalled();
        expect(result.landlordId).toBe(landlordId);
      });
    });

    // F11: Find My Rooms
    describe('findMyRooms (F11)', () => {
      it('nên trả về danh sách phòng thuộc sở hữu của landlord', async () => {
        const landlordId = 24100323;
        const mockRooms = [{ id: 1, title: 'Phòng 1', landlordId }];
        mockRoomRepository.find.mockResolvedValue(mockRooms);

        const result = await service.findMyRooms(landlordId);

        expect(mockRoomRepository.find).toHaveBeenCalledWith({
          where: { landlordId },
          order: { createdAt: 'DESC' },
        });
        expect(result).toEqual(mockRooms);
      });
    });

    // F12: Update Room
    describe('update (F12)', () => {
      const landlordId = 24100323;
      const roomId = 1;
      const existingRoom = { id: roomId, landlordId, title: 'Cũ' };

      it('nên cho phép cập nhật khi đúng chủ sở hữu', async () => {
        mockRoomRepository.findOne
          .mockResolvedValueOnce(existingRoom)
          .mockResolvedValueOnce({ ...existingRoom, title: 'Mới' });

        const result = await service.update(roomId, landlordId, { title: 'Mới' });

        expect(mockRoomRepository.update).toHaveBeenCalledWith(roomId, { title: 'Mới' });
        expect(result.title).toBe('Mới');
      });

      it('nên ném NotFoundException nếu phòng không tồn tại', async () => {
        mockRoomRepository.findOne.mockResolvedValue(null);

        await expect(service.update(99, landlordId, {})).rejects.toThrow(NotFoundException);
      });

      it('nên ném ForbiddenException nếu không phải chính chủ', async () => {
        mockRoomRepository.findOne.mockResolvedValue({ id: roomId, landlordId: 999 });

        await expect(service.update(roomId, landlordId, {})).rejects.toThrow(ForbiddenException);
      });
    });

    // F13: Remove Room
    describe('remove (F13)', () => {
      const landlordId = 24100323;
      const roomId = 1;
      const existingRoom = { id: roomId, landlordId, title: 'Phòng cần xóa' };

      it('nên xóa hợp đồng, lượt yêu thích và bài đăng phòng khi đúng chủ sở hữu', async () => {
        mockRoomRepository.findOne.mockResolvedValue(existingRoom);

        await service.remove(roomId, landlordId);

        expect(mockContractRepository.delete).toHaveBeenCalledWith({ roomId });
        expect(mockFavouriteRepository.delete).toHaveBeenCalledWith({ roomId });
        expect(mockRoomRepository.remove).toHaveBeenCalledWith(existingRoom);
      });

      it('nên ném NotFoundException nếu phòng không tồn tại hoặc không chính chủ', async () => {
        mockRoomRepository.findOne.mockResolvedValue(null);

        await expect(service.remove(roomId, landlordId)).rejects.toThrow(NotFoundException);
      });
    });
  });

  // =========================================================================
  // [ZONE 2] CHỨC NĂNG TRA CỨU, BỘ LỌC VÀ ẢNH (F04, F05, F06, F19, F20, TENANT ROOM)
  // =========================================================================
  describe('Search & Image Zone', () => {
    // F04: Find All Available
    describe('findAllAvailable (F04)', () => {
      it('nên trả về danh sách phòng có status là Available', async () => {
        const mockRooms = [{ id: 1, status: 'Available' }];
        mockRoomRepository.find.mockResolvedValue(mockRooms);

        const result = await service.findAllAvailable();

        expect(mockRoomRepository.find).toHaveBeenCalledWith({
          where: { status: 'Available' },
          relations: ['images'],
          order: { createdAt: 'DESC' },
        });
        expect(result).toEqual(mockRooms);
      });
    });

    // Find Active Room By Tenant ID
    describe('findActiveRoomByTenantId', () => {
      it('nên trả về null nếu tenant không có hợp đồng active', async () => {
        mockContractRepository.findOne.mockResolvedValue(null);

        const result = await service.findActiveRoomByTenantId(10);

        expect(result).toBeNull();
      });

      it('nên trả về dữ liệu phòng đã được phẳng hóa với hợp đồng', async () => {
        const activeContract = {
          id: 5,
          roomId: 1,
          tenantId: 10,
          status: ContractStatus.ACTIVE,
          startDate: new Date(),
          endDate: new Date(),
          price: 2000000,
        };
        const mockRoom = { id: 1, title: 'Phòng 1', price: 2500000 };

        mockContractRepository.findOne.mockResolvedValue(activeContract);
        mockRoomRepository.findOne.mockResolvedValue(mockRoom);

        const result = await service.findActiveRoomByTenantId(10);

        expect(result).toEqual({
          ...mockRoom,
          contractId: activeContract.id,
          startDate: activeContract.startDate,
          endDate: activeContract.endDate,
          monthlyPrice: activeContract.price,
        });
      });
    });

    // F05: Find One Detail
    describe('findOneDetail (F05)', () => {
      it('nên trả về chi tiết phòng khi tìm thấy', async () => {
        const mockRoom = { id: 1, title: 'Phòng 1' };
        mockQueryBuilder.getOne.mockResolvedValue(mockRoom);

        const result = await service.findOneDetail(1);

        expect(result).toEqual(mockRoom);
      });

      it('nên ném NotFoundException nếu không tìm thấy phòng', async () => {
        mockQueryBuilder.getOne.mockResolvedValue(null);

        await expect(service.findOneDetail(99)).rejects.toThrow(NotFoundException);
      });
    });

    // F06: Search Rooms
    describe('searchRooms (F06)', () => {
      it('nên áp dụng đúng bộ lọc tìm kiếm', async () => {
        const mockRooms = [{ id: 1, district: 'Cầu Giấy', price: 3000000 }];
        mockQueryBuilder.getMany.mockResolvedValue(mockRooms);

        const filters = {
          district: 'Cầu Giấy',
          minPrice: 1000000,
          maxPrice: 5000000,
          hasAc: true,
        };

        const result = await service.searchRooms(filters);

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          'room.district LIKE :district',
          { district: '%Cầu Giấy%' },
        );
        expect(result).toEqual(mockRooms);
      });
    });

    // F19: Add Room Image
    describe('addRoomImage (F19)', () => {
      const landlordId = 24100323;
      const roomId = 1;

      it('nên thêm ảnh thành công khi chính chủ thao tác', async () => {
        mockRoomRepository.findOne.mockResolvedValue({ id: roomId, landlordId });

        const mockImageRepo = {
          create: jest.fn((dto) => dto),
          save: jest.fn((dto) => Promise.resolve({ id: 10, ...dto })),
        };
        mockRoomRepository.manager.getRepository.mockReturnValue(mockImageRepo);

        const result = await service.addRoomImage(
          roomId,
          landlordId,
          'http://image.url',
          'public_123',
        );

        expect(result).toEqual({
          id: 10,
          roomId,
          imageUrl: 'http://image.url',
          publicId: 'public_123',
        });
      });
    });

    // F20: Delete Room Image
    describe('deleteRoomImage (F20)', () => {
      const landlordId = 24100323;
      const roomId = 1;
      const imageId = 10;

      it('nên xóa ảnh thành công khi ảnh tồn tại', async () => {
        mockRoomRepository.findOne.mockResolvedValue({ id: roomId, landlordId });

        const mockImageRepo = {
          findOne: jest.fn().mockResolvedValue({ id: imageId, roomId }),
          delete: jest.fn().mockResolvedValue({ affected: 1 }),
        };
        mockRoomRepository.manager.getRepository.mockReturnValue(mockImageRepo);

        const result = await service.deleteRoomImage(roomId, imageId, landlordId);

        expect(result.message).toContain(`Xóa thành công ảnh có ID ${imageId}`);
        expect(mockImageRepo.delete).toHaveBeenCalledWith(imageId);
      });

      it('nên ném NotFoundException nếu không tìm thấy ảnh', async () => {
        mockRoomRepository.findOne.mockResolvedValue({ id: roomId, landlordId });

        const mockImageRepo = {
          findOne: jest.fn().mockResolvedValue(null),
        };
        mockRoomRepository.manager.getRepository.mockReturnValue(mockImageRepo);

        await expect(
          service.deleteRoomImage(roomId, 999, landlordId),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });
});