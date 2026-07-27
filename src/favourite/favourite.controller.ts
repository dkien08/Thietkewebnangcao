import { Controller, Get, Post, Body, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { FavouriteService } from './favourite.service';
import { ToggleFavouriteDto } from './dto/toggle-favourite.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'; // Đường dẫn tới file guard JWT của bạn

@Controller('favorites')
@UseGuards(JwtAuthGuard) // 🟢 Bảo vệ toàn bộ các route trong controller này bằng JWT
export class FavouriteController {
  constructor(private readonly favouriteService: FavouriteService) {}

  // Hàm helper an toàn để lấy userId chuẩn từ Token
  private getUserId(req: any): number {
    const userId = req.user?.sub ?? req.user?.userId ?? req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Không tìm thấy thông tin xác thực người dùng');
    }
    return Number(userId);
  }

  // [F07] Lưu hoặc bỏ lưu phòng trọ (Toggle) của chính user đang đăng nhập
  @Post()
  async toggle(@Req() req: any, @Body() body: ToggleFavouriteDto) {
    const userId = this.getUserId(req); // 🟢 Lấy đúng ID từ token
    return this.favouriteService.toggleFavourite(userId, body.roomId);
  }

  // [F18] Hiển thị danh sách phòng yêu thích ĐÚNG CỦA RIÊNG Tenant đó
  @Get()
  async getMyFavourites(@Req() req: any) {
    const userId = this.getUserId(req); // 🟢 Lấy đúng ID từ token, không sợ bị lộ của người khác
    return this.favouriteService.getMyFavourites(userId);
  }
}