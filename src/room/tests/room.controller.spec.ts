import { Test, TestingModule } from "@nestjs/testing";
import { RoomController } from "../room.controller";
import { RoomService } from "../room.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { ForbiddenException, BadRequestException } from "@nestjs/common";

describe("RoomController", () => {
  let controller: RoomController;
  let service: RoomService;

  // Mock RoomService với tất cả các hàm controller sử dụng
  const mockRoomService = {
    create: jest.fn(),
    findMyRooms: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findAllAvailable: jest.fn(),
    searchRooms: jest.fn(),
    findActiveRoomByTenantId: jest.fn(),
    findOneDetail: jest.fn(),
    addRoomImage: jest.fn(),
    deleteRoomImage: jest.fn(),
  };

  // Mock JwtAuthGuard để bypass Guard trong quá trình test
  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomController],
      providers: [
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<RoomController>(RoomController);
    service = module.get<RoomService>(RoomService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

 // =========================================================================
  // HELPER FUNCTIONS TESTS (checkLandlordRole & getUserId)
  // =========================================================================
  describe("Helper Functions & Guard Checks", () => {
    it("nên ném ForbiddenException nếu user không có role hoặc currentMode là Landlord", async () => {
      const mockReq = { user: { role: "Tenant", currentMode: "Tenant", sub: 1 } };

      expect(() => controller.createRoom(mockReq, { title: "Test" } as any)).rejects.toThrow(ForbiddenException);
    });

    it("nên ném ForbiddenException nếu không thể trích xuất User ID từ request", () => {
      const mockReq = { user: { role: "Landlord" } }; // Có role nhưng thiếu sub/userId/id

      // Gọi trực tiếp hàm helper getUserId để test chuẩn xác nhất
      expect(() => (controller as any).getUserId(mockReq)).toThrow(
        ForbiddenException
      );
    });
  });
  // =========================================================================
  // [ZONE 1] CHỨC NĂNG CỦA LANDLORD (F10, F11, F12, F13)
  // =========================================================================
  describe("Landlord Management Zone", () => {
    const mockLandlordReq = {
      user: { sub: 24100323, role: "Landlord", currentMode: "Landlord" },
    };

    // F10: Create Room
    describe("createRoom (F10)", () => {
      it("nên gọi roomService.create với đúng thông tin", async () => {
        const createDto = { title: "Phòng trọ mới", price: 3000000 } as any;
        const expectedResult = { id: 1, ...createDto, landlordId: 24100323 };
        mockRoomService.create.mockResolvedValue(expectedResult);

        const result = await controller.createRoom(mockLandlordReq, createDto);

        expect(service.create).toHaveBeenCalledWith(createDto, 24100323);
        expect(result).toEqual(expectedResult);
      });
    });

    // F11: Find My Rooms
    describe("findMyRooms (F11)", () => {
      it("nên trả về danh sách phòng của chủ nhà", async () => {
        const mockRooms = [{ id: 1, title: "Phòng 1" }];
        mockRoomService.findMyRooms.mockResolvedValue(mockRooms);

        const result = await controller.findMyRooms(mockLandlordReq);

        expect(service.findMyRooms).toHaveBeenCalledWith(24100323);
        expect(result).toEqual(mockRooms);
      });
    });

    // F12: Update Room
    describe("update (F12)", () => {
      it("nên cập nhật phòng thành công", async () => {
        const updateData = { title: "Phòng đã sửa" };
        const mockUpdatedRoom = { id: 1, title: "Phòng đã sửa" };
        mockRoomService.update.mockResolvedValue(mockUpdatedRoom);

        const result = await controller.update(1, mockLandlordReq, updateData);

        expect(service.update).toHaveBeenCalledWith(1, 24100323, updateData);
        expect(result).toEqual(mockUpdatedRoom);
      });
    });

    // F13: Delete Room
    describe("deleteRoom (F13)", () => {
      it("nên gọi roomService.remove để xóa phòng", async () => {
        const mockResponse = { message: "Xóa thành công" };
        mockRoomService.remove.mockResolvedValue(mockResponse);

        const result = await controller.deleteRoom(1, mockLandlordReq);

        expect(service.remove).toHaveBeenCalledWith(1, 24100323);
        expect(result).toEqual(mockResponse);
      });
    });
  });

  // =========================================================================
  // [ZONE 2] CHỨC NĂNG TRA CỨU, BỘ LỌC VÀ ẢNH (F04, F05, F06, F19, F20)
  // =========================================================================
  describe("Public & Image Zone", () => {
    // F04: Find All Available
    describe("findAllAvailable (F04)", () => {
      it("nên trả về danh sách các phòng còn trống", async () => {
        const mockRooms = [{ id: 1, status: "Available" }];
        mockRoomService.findAllAvailable.mockResolvedValue(mockRooms);

        const result = await controller.findAllAvailable();

        expect(service.findAllAvailable).toHaveBeenCalled();
        expect(result).toEqual(mockRooms);
      });
    });

    // F06: Search Rooms
    describe("searchRooms (F06)", () => {
      it("nên truyền đúng dto tìm kiếm vào service", async () => {
        const searchDto = { district: "Cầu Giấy", minPrice: 2000000 } as any;
        const mockRooms = [{ id: 1, district: "Cầu Giấy" }];
        mockRoomService.searchRooms.mockResolvedValue(mockRooms);

        const result = await controller.searchRooms(searchDto);

        expect(service.searchRooms).toHaveBeenCalledWith(searchDto);
        expect(result).toEqual(mockRooms);
      });
    });

    // My Active Room
    describe("findMyActiveRoom", () => {
      it("nên lấy danh sách phòng đang thuê của tenant", async () => {
        const mockTenantReq = { user: { id: 10, role: "Tenant" } };
        const mockActiveRoom = { id: 1, title: "Phòng đang thuê" };
        mockRoomService.findActiveRoomByTenantId.mockResolvedValue(mockActiveRoom);

        const result = await controller.findMyActiveRoom(mockTenantReq);

        expect(service.findActiveRoomByTenantId).toHaveBeenCalledWith(10);
        expect(result).toEqual(mockActiveRoom);
      });
    });

    // F05: Find One Detail
    describe("findOneDetail (F05)", () => {
      it("nên trả về chi tiết phòng theo ID", async () => {
        const mockRoom = { id: 1, title: "Chi tiết phòng" };
        mockRoomService.findOneDetail.mockResolvedValue(mockRoom);

        const result = await controller.findOneDetail(1);

        expect(service.findOneDetail).toHaveBeenCalledWith(1);
        expect(result).toEqual(mockRoom);
      });
    });

    // F19: Add Image
    describe("addImage (F19)", () => {
      const mockLandlordReq = { user: { sub: 24100323, role: "Landlord" } };

      it("nên ném BadRequestException nếu không gửi kèm file", async () => {
        await expect(
          controller.addImage("1", null, mockLandlordReq)
        ).rejects.toThrow(BadRequestException);
      });

      it("nên thêm ảnh thành công khi có file", async () => {
        const mockFile = {
          path: "/uploads/image.jpg",
          filename: "image.jpg",
        };
        const mockSavedImage = { id: 10, imageUrl: "/uploads/image.jpg" };
        mockRoomService.addRoomImage.mockResolvedValue(mockSavedImage);

        const result = await controller.addImage("1", mockFile, mockLandlordReq);

        expect(service.addRoomImage).toHaveBeenCalledWith(
          1,
          24100323,
          "/uploads/image.jpg",
          "image.jpg"
        );
        expect(result).toEqual(mockSavedImage);
      });
    });

    // F20: Delete Room Image
    describe("deleteRoomImage (F20)", () => {
      const mockLandlordReq = { user: { sub: 24100323, role: "Landlord" } };

      it("nên xóa ảnh thành công", async () => {
        const mockResponse = { message: "Xóa thành công ảnh có ID 10" };
        mockRoomService.deleteRoomImage.mockResolvedValue(mockResponse);

        const result = await controller.deleteRoomImage(1, 10, mockLandlordReq);

        expect(service.deleteRoomImage).toHaveBeenCalledWith(1, 10, 24100323);
        expect(result).toEqual(mockResponse);
      });
    });
  });
});