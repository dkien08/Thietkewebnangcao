import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favourite } from './favourite.entity';

@Injectable()
export class FavouriteService {
  constructor(
    @InjectRepository(Favourite)
    private readonly favouriteRepository: Repository<Favourite>,
  ) {}

  // F07: Toggle Favorite (Nếu có thì xóa, chưa có thì thêm mới)
  async toggleFavourite(userId: number, roomId: number): Promise<{ message: string; isFavorite: boolean }> {
    const favourite = await this.favouriteRepository.findOne({
      where: { userId, roomId },
    });

    if (favourite) {
      await this.favouriteRepository.remove(favourite);
      return { message: 'Đã bỏ lưu phòng trọ khỏi danh sách yêu thích.', isFavorite: false };
    } else {
      const newFavourite = this.favouriteRepository.create({ userId, roomId });
      await this.favouriteRepository.save(newFavourite);
      return { message: 'Đã lưu phòng trọ vào danh sách yêu thích.', isFavorite: true };
    }
  }

  // F18: Lấy danh sách thông tin chi tiết các phòng trọ đã thích
  async getMyFavourites(userId: number): Promise<any[]> {
    const favourites = await this.favouriteRepository.find({
      where: { userId },
      relations: ['room'], // Tự động JOIN lấy thông tin chi tiết từ bảng rooms
    });
    return favourites.map(f => f.room);
  }

  // Giữ lại các hàm cũ của bạn nếu hệ thống cần dùng ở nơi khác
  async create(favouriteData: Partial<Favourite>): Promise<Favourite> {
    const newFavourite = this.favouriteRepository.create(favouriteData);
    return await this.favouriteRepository.save(newFavourite);
  }

  async findAll(): Promise<Favourite[]> {
    return await this.favouriteRepository.find();
  }

  async findOne(userId: number, roomId: number): Promise<Favourite> {
    const favourite = await this.favouriteRepository.findOne({
      where: { userId, roomId },
    });
    if (!favourite) {
      throw new NotFoundException(`Không tìm thấy lượt lưu thích của User ${userId} với Room ${roomId}`);
    }
    return favourite;
  }

  async remove(userId: number, roomId: number): Promise<{ message: string }> {
    const favourite = await this.findOne(userId, roomId);
    await this.favouriteRepository.remove(favourite);
    return { message: `Đã xóa phòng ${roomId} khỏi danh sách yêu thích của User ${userId}` };
  }
}