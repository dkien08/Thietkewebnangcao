import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { FavouriteService } from './favourite.service';
import { ToggleFavouriteDto } from './dto/toggle-favourite.dto';

@Controller('api/favorites')
export class FavouriteController {
  constructor(private readonly favouriteService: FavouriteService) {}

  // F07: Lưu hoặc bỏ lưu phòng trọ (Toggle)
  @Post()
  async toggle(@Req() req: any, @Body() body: ToggleFavouriteDto) {
    const userId = req.user?.id || 1; // Mặc định là 1 nếu chưa đăng nhập
    return this.favouriteService.toggleFavourite(userId, body.roomId);
  }

  // F18: Hiển thị danh sách toàn bộ phòng trọ đã yêu thích của Tenant
  @Get()
  async getMyFavourites(@Req() req: any) {
    const userId = req.user?.id || 1; // Mặc định là 1 nếu chưa đăng nhập
    return this.favouriteService.getMyFavourites(userId);
  }
}