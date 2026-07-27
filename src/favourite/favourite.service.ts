import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favourite } from './favourite.entity';

@Injectable()
export class FavouriteService {
  constructor(
    @InjectRepository(Favourite)
    private favouriteRepository: Repository<Favourite>,
  ) {}

  async getMyFavourites(userId: number) {
    // 🟢 Đảm bảo chỉ query đúng dữ liệu thuộc về userId này
    return await this.favouriteRepository.find({
      where: { userId },
      relations: ['room', 'room.images'], // Load kèm thông tin phòng và ảnh phòng
      order: { createdAt: 'DESC' },
    });
  }

  async toggleFavourite(userId: number, roomId: number) {
    const existing = await this.favouriteRepository.findOne({
      where: { userId, roomId },
    });

    if (existing) {
      await this.favouriteRepository.remove(existing);
      return { message: 'Đã xóa khỏi danh sách yêu thích', isFavourite: false };
    } else {
      const newFav = this.favouriteRepository.create({ userId, roomId });
      await this.favouriteRepository.save(newFav);
      return { message: 'Đã thêm vào danh sách yêu thích', isFavourite: true };
    }
  }
}