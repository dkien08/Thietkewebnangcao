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
} from "@nestjs/common";
import { RoomService } from "./room.service";
import { Room } from "./room.entity";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard"; // Điều chỉnh đường dẫn JwtAuthGuard của nhóm bạn nhé

@Controller("rooms")
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  // Hàm helper dùng chung để kiểm tra vai trò Landlord
  private checkLandlordRole(req: any) {
    if (req.user?.role !== "Landlord") {
      throw new ForbiddenException("Chỉ có vai trò Chủ nhà mới được phép thực hiện thao tác này");
    }
  }

  // =========================================================================
  // [ZONE 1] KHU VỰC CỦA TV1 (TRƯỞNG NHÓM - KIÊN)
  // Quản lý các chức năng: F10, F11, F12, F13
  // =========================================================================

  // F10: Đăng phòng trọ mới
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() roomData: Partial<Room>) {
    this.checkLandlordRole(req);
    return this.roomService.create(req.user.sub, roomData); // Dùng biến sub chuẩn bảo mật
  }

  // F11: Xem danh sách phòng thuộc sở hữu của riêng chủ nhà đang đăng nhập
  @Get("landlord")
  @UseGuards(JwtAuthGuard)
  findMyRooms(@Req() req: any) {
    this.checkLandlordRole(req);
    return this.roomService.findMyRooms(req.user.sub);
  }

  // F12: Sửa thông tin mô tả phòng hoặc cập nhật trạng thái (Bảo trì,...)
  @Put(":id")
  @UseGuards(JwtAuthGuard)
  update(
    @Param("id") id: string,
    @Req() req: any,
    @Body() updateData: Partial<Room>
  ) {
    this.checkLandlordRole(req);
    return this.roomService.update(+id, req.user.sub, updateData);
  }

  // F13: Xóa bài đăng phòng trọ
  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  remove(@Param("id") id: string, @Req() req: any) {
    this.checkLandlordRole(req);
    return this.roomService.remove(+id, req.user.sub);
  }


  // =========================================================================
  // [ZONE 2] KHU VỰC CỦA TV2 
  // TV2 VUI LÒNG CHỈ VIẾT CODE CỦA BẠN TỪ DÒNG NÀY TRỞ XUỐNG DƯỚI
  // Các chức năng phụ trách: F04, F05, F06 (Xem/Tìm kiếm) & F19, F20 (Ảnh phòng)
  // =========================================================================

}