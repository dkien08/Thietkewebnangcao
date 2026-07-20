import { Test, TestingModule } from "@nestjs/testing";
import { RoomService } from "../room.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Room } from "../room.entity";
import { NotFoundException, ForbiddenException } from "@nestjs/common";
import { describe, beforeEach, it, expect, jest } from "@jest/globals";

describe("RoomService (Zone 1 - Chức năng của Kiên)", () => {
  let service: RoomService;
  let mockRoomRepository: any;

  // Khởi tạo Factory giả lập các hàm cơ bản của TypeORM Repository
  // Sử dụng Arrow Function để bypass hoàn toàn lỗi gán kiểu 'never' của Jest
  const mockRoomRepositoryFactory = () => ({
    create: jest.fn((dto: any) => dto),
    save: jest.fn((room: any) => 
      Promise.resolve({ id: 1, ...room })
    ),
    find: jest.fn(() => 
      Promise.resolve([])
    ),
    findOne: jest.fn(() => 
      Promise.resolve(null)
    ),
    update: jest.fn(() => 
      Promise.resolve({ affected: 1 })
    ),
    delete: jest.fn(() => 
      Promise.resolve({ affected: 1 })
    ),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        {
          provide: getRepositoryToken(Room),
          useFactory: mockRoomRepositoryFactory,
        },
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
    mockRoomRepository = module.get(getRepositoryToken(Room));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // =========================================================================
  // [ZONE 1] TEST CHỨC NĂNG CỦA TV1 (KIÊN)
  // Các hàm kiểm thử: create (F10), findMyRooms (F11), update (F12), remove (F13)
  // =========================================================================
  describe("Chức năng Quản lý Phòng của Landlord", () => {
    
    // Test F10: Đăng phòng mới
    describe("create (F10)", () => {
      it("nên đăng ký phòng mới thành công với trạng thái mặc định là Available", async () => {
        const roomData = {
          title: "Phòng trọ giá rẻ",
          price: 2500000,
          area: 25.5,
          district: "Cầu Giấy",
          addressDetail: "Số 12 Ngõ 34 Cầu Giấy",
        };
        const landlordId = 24100323;

        const result = await service.create(landlordId, roomData);

        expect(result).toBeDefined();
        expect(result.landlordId).toEqual(landlordId);
        expect(result.status).toEqual("Available");
        expect(mockRoomRepository.save).toHaveBeenCalled();
      });
    });

    // Test F11: Lấy danh sách phòng của tôi
    describe("findMyRooms (F11)", () => {
      it("nên trả về danh sách phòng thuộc sở hữu của riêng chủ nhà đăng nhập", async () => {
        const landlordId = 24100323;
        const mockRooms = [
          { id: 1, title: "Phòng 1", landlordId },
          { id: 2, title: "Phòng 2", landlordId },
        ];
        mockRoomRepository.find.mockImplementation(() => Promise.resolve(mockRooms));

        const result = await service.findMyRooms(landlordId);

        expect(result).toHaveLength(2);
        expect(result[0].landlordId).toEqual(landlordId);
      });
    });

    // Test F12: Sửa thông tin phòng / Bảo trì
    describe("update (F12)", () => {
      const landlordId = 24100323;
      const roomId = 1;
      const mockExistingRoom = { id: roomId, title: "Phòng cũ", landlordId };

      it("nên cho phép cập nhật nếu đúng chính chủ nhà sở hữu phòng", async () => {
        mockRoomRepository.findOne.mockImplementation(() => Promise.resolve(mockExistingRoom));
        const updateData = { title: "Phòng đã sửa tiêu đề", status: "Maintenance" };

        const result = await service.update(roomId, landlordId, updateData);

        expect(mockRoomRepository.update).toHaveBeenCalledWith(roomId, updateData);
        expect(result).toBeDefined();
      });

      it("nên ném lỗi NotFoundException nếu phòng không tồn tại", async () => {
        mockRoomRepository.findOne.mockImplementation(() => Promise.resolve(null));
        
        await expect(service.update(99, landlordId, { title: "Test" })).rejects.toThrow(NotFoundException);
      });

      it("nên ném lỗi ForbiddenException nếu chủ nhà khác cố tình sửa phòng không thuộc sở hữu", async () => {
        mockRoomRepository.findOne.mockImplementation(() => Promise.resolve(mockExistingRoom));
        const hackerLandlordId = 999999; // ID chủ nhà khác bẻ khóa URL

        await expect(
          service.update(roomId, hackerLandlordId, { title: "Hack tiêu đề" })
        ).rejects.toThrow(ForbiddenException);
      });
    });

    // Test F13: Xóa bài đăng phòng trọ
    describe("remove (F13)", () => {
      const landlordId = 24100323;
      const roomId = 1;
      const mockExistingRoom = { id: roomId, title: "Phòng cần xóa", landlordId };

      it("Chính chủ yêu cầu xóa phòng trọ -> Thành công", async () => {
        mockRoomRepository.findOne.mockImplementation(() => Promise.resolve(mockExistingRoom));

        const result = await service.remove(roomId, landlordId);

        expect(mockRoomRepository.delete).toHaveBeenCalledWith(roomId);
        expect(result.message).toContain("Xóa thành công phòng trọ");
      });

      it("Chủ nhà khác cố tình xóa phòng -> Thất bại, ném lỗi ForbiddenException", async () => {
        mockRoomRepository.findOne.mockImplementation(() => Promise.resolve(mockExistingRoom));
        const hackerLandlordId = 999999;

        await expect(service.remove(roomId, hackerLandlordId)).rejects.toThrow(ForbiddenException);
      });
    });
  });

  // =========================================================================
  // [ZONE 2] KHU VỰC CỦA TV2
  //  TV2 viết tiếp các ca kiểm thử cho chức năng tra cứu/ảnh ở dưới này
  // =========================================================================
  // =========================================================================
  // [ZONE 2] KHU VỰC CỦA TV2
  // Các ca kiểm thử cho F04, F05, F06, F19, F20
  // =========================================================================
  describe("Chức năng Tìm kiếm & Quản lý Ảnh (TV2)", () => {

    // Test F04: Lấy danh sách phòng trống
    describe("findAllAvailable (F04)", () => {
      it("nên trả về danh sách các phòng trọ có status là Available", async () => {
        const mockAvailableRooms = [{ id: 1, title: "Phòng trống", status: "Available" }];
        mockRoomRepository.find.mockImplementation(() => Promise.resolve(mockAvailableRooms));

        const result = await service.findAllAvailable();

        expect(result).toHaveLength(1);
        expect(result[0].status).toBe("Available");
        expect(mockRoomRepository.find).toHaveBeenCalledWith(
          expect.objectContaining({ where: { status: "Available" } })
        );
      });
    });

    // Test F19: Thêm ảnh cho phòng trọ
    describe("addRoomImage (F19)", () => {
      const landlordId = 24100323;
      const roomId = 1;
      const mockExistingRoom = { id: roomId, title: "Phòng của tôi", landlordId };

      it("nên thêm ảnh thành công khi chính chủ phòng thao tác", async () => {
        mockRoomRepository.findOne.mockImplementation(() => Promise.resolve(mockExistingRoom));

        const mockSavedImage = { id: 10, roomId, imageUrl: "http://cloudinary.com/test.jpg" };
        mockRoomRepository.manager = {
          getRepository: jest.fn().mockReturnValue({
            create: jest.fn((dto: any) => dto),
            save: jest.fn((img: any) => Promise.resolve({ id: 10, ...img })),
          }),
        } as any;

        const result = await service.addRoomImage(roomId, landlordId, "http://cloudinary.com/test.jpg");

        expect(result).toBeDefined();
        expect(result.imageUrl).toBe("http://cloudinary.com/test.jpg");
      });

      it("nên ném lỗi ForbiddenException nếu chủ nhà khác cố tình tải ảnh lên phòng không thuộc về mình", async () => {
        mockRoomRepository.findOne.mockImplementation(() => Promise.resolve(mockExistingRoom));
        const hackerLandlordId = 999999;

        await expect(
          service.addRoomImage(roomId, hackerLandlordId, "http://cloudinary.com/test.jpg")
        ).rejects.toThrow(ForbiddenException);
      });
    });

    // Test F20: Xóa ảnh lẻ của phòng trọ
    describe("deleteRoomImage (F20)", () => {
      const landlordId = 24100323;
      const roomId = 1;
      const imageId = 10;
      const mockExistingRoom = { id: roomId, title: "Phòng của tôi", landlordId };

      it("nên xóa ảnh thành công khi ảnh tồn tại và đúng chính chủ", async () => {
        mockRoomRepository.findOne.mockImplementation(() => Promise.resolve(mockExistingRoom));

        const mockImage = { id: imageId, roomId, imageUrl: "http://cloudinary.com/test.jpg" };
        mockRoomRepository.manager = {
          getRepository: jest.fn().mockReturnValue({
            findOne: jest.fn<any>().mockImplementation(() => Promise.resolve(mockImage)),
            delete: jest.fn<any>().mockImplementation(() => Promise.resolve({ affected: 1 })),
          }),
        } as any;

        const result = await service.deleteRoomImage(roomId, imageId, landlordId);

        expect(result.message).toContain(`Xóa thành công ảnh có ID ${imageId}`);
      });

      it("nên ném lỗi NotFoundException khi ảnh không tồn tại", async () => {
        mockRoomRepository.findOne.mockImplementation(() => Promise.resolve(mockExistingRoom));

        mockRoomRepository.manager = {
          getRepository: jest.fn().mockReturnValue({
            findOne: jest.fn<any>().mockImplementation(() => Promise.resolve(null)),
          }),
        } as any;

        await expect(
          service.deleteRoomImage(roomId, 999, landlordId)
        ).rejects.toThrow(NotFoundException);
      });
    });

  }); 
}); 