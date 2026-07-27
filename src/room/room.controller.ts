import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
  Query,
  ParseIntPipe,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from '@nestjs/platform-express';
import { SearchRoomDto } from "./dto/search-room.dto";
import { RoomService } from "./room.service";
import { Room } from "./room.entity";
import { CreateRoomDto } from "./dto/create-room.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@Controller("rooms")
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  // -------------------------------------------------------------------------
  // HELPER FUNCTIONS (Dùng chung cho toàn bộ Controller)
  // -------------------------------------------------------------------------

  /**
   * Kiểm tra quyền Landlord (Hỗ trợ cả trường hợp role hoặc currentMode là Landlord)
   */
  private checkLandlordRole(req: any) {
    const isLandlordRole = req.user?.role === "Landlord";
    const isLandlordMode = req.user?.currentMode === "Landlord";

    if (!isLandlordRole && !isLandlordMode) {
      throw new ForbiddenException("Chỉ có vai trò Chủ nhà mới được phép thực hiện thao tác này");
    }
  }

  /**
   * Trích xuất User ID an toàn từ JWT Payload (Tương thích với sub, userId, id)
   */
  private getUserId(req: any): number {
    const userId = req.user?.sub ?? req.user?.userId ?? req.user?.id;
    if (!userId || Number.isNaN(Number(userId))) {
      throw new ForbiddenException("Không xác định được người dùng hiện tại");
    }
    return Number(userId);
  }

  // =========================================================================
  // [ZONE 1] KHU VỰC CỦA TV1 (TRƯỞNG NHÓM - KIÊN)
  // Quản lý các chức năng: F10, F11, F12, F13
  // =========================================================================

  // F10: Đăng phòng trọ mới
  @Post()
  @UseGuards(JwtAuthGuard)
  async createRoom(@Req() req: any, @Body() createRoomDto: CreateRoomDto) {
    this.checkLandlordRole(req);
    const landlordId = this.getUserId(req);
    return this.roomService.create(createRoomDto, landlordId);
  }

  // F11: Xem danh sách phòng thuộc sở hữu của riêng chủ nhà đang đăng nhập
  @Get("landlord")
  @UseGuards(JwtAuthGuard)
  findMyRooms(@Req() req: any) {
    this.checkLandlordRole(req);
    return this.roomService.findMyRooms(this.getUserId(req));
  }

  // F12: Sửa thông tin mô tả phòng hoặc cập nhật trạng thái (Bảo trì,...)
  @Put(":id")
  @UseGuards(JwtAuthGuard)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: any,
    @Body() updateData: Partial<Room>
  ) {
    this.checkLandlordRole(req);
    return this.roomService.update(id, this.getUserId(req), updateData);
  }

  // F13: Xóa bài đăng phòng trọ
 @Delete(':id')
@UseGuards(JwtAuthGuard)
async deleteRoom(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
  this.checkLandlordRole(req);
  const landlordId = req.user?.sub ?? req.user?.userId ?? req.user?.id;
  
  // Gọi đúng tên hàm 'remove' đã định nghĩa trong room.service.ts
  return this.roomService.remove(id, landlordId);
}


  // =========================================================================
  // [ZONE 2] KHU VỰC CỦA TV2 
  // Quản lý các chức năng: Xem công khai, Tìm kiếm, Chi tiết, Quản lý Ảnh
  // =========================================================================

  // Lấy danh sách tất cả phòng còn trống (Public)
  @Get()
  findAllAvailable() {
    return this.roomService.findAllAvailable();
  }

  // F06: Bộ lọc tìm kiếm nâng cao (Public)
  @Get("search")
  searchRooms(@Query() searchDto: SearchRoomDto) {
    return this.roomService.searchRooms(searchDto);
  }

  // API dành cho Tenant lấy thông tin phòng đang thuê thực tế
  // (ĐẶT Ở ĐÂY - Trước route :id để tránh xung đột routing NestJS)
  @Get("my-active-room")
  @UseGuards(JwtAuthGuard)
  findMyActiveRoom(@Req() req: any) {
    const tenantId = this.getUserId(req);
    return this.roomService.findActiveRoomByTenantId(tenantId);
  }

  // F05: Xem chi tiết một phòng trọ cụ thể (Public)
  @Get(":id")
  findOneDetail(@Param("id", ParseIntPipe) id: number) {
    return this.roomService.findOneDetail(id);
  }

  // F19: Thêm ảnh phòng trọ
  @Post(':id/images')
@UseGuards(JwtAuthGuard)
@UseInterceptors(FileInterceptor('image'))
async addImage(
  @Param('id') roomId: string,
  @UploadedFile() file: any, // 🟢 Đổi thành any để tránh lỗi namespace Multer
  @Req() req: any,
) {
  this.checkLandlordRole(req);

  if (!file) {
    throw new BadRequestException('Không tìm thấy file tải lên');
  }

  // 1. Lấy landlordId từ token hiện tại
  const landlordId = req.user?.sub ?? req.user?.userId ?? req.user?.id;

  // 2. Lấy đường dẫn file (hoặc tên file/path tùy thuộc vào cấu hình lưu trữ của bạn)
  const imageUrl = file.path || file.url || `/uploads/${file.filename || file.originalname}`;
  const publicId = file.filename || file.public_id || null;

  // 3. Truyền đủ 4 tham số khớp 100% với định nghĩa trong room.service.ts
  return this.roomService.addRoomImage(+roomId, landlordId, imageUrl, publicId);
}

  // F20: Xóa lẻ ảnh phòng trọ
  @Delete(":roomId/images/:imageId")
  @UseGuards(JwtAuthGuard)
  async deleteRoomImage(
    @Param("roomId", ParseIntPipe) roomId: number,
    @Param("imageId", ParseIntPipe) imageId: number,
    @Req() req: any
  ) {
    this.checkLandlordRole(req);
    const landlordId = this.getUserId(req);
    return this.roomService.deleteRoomImage(roomId, imageId, landlordId);
  }
}