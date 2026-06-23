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

  // 1. CREATE: Thêm vào danh sách yêu thích
  async create(favouriteData: Partial<Favourite>): Promise<Favourite> {
    const newFavourite = this.favouriteRepository.create(favouriteData);
    return await this.favouriteRepository.save(newFavourite);
  }

  // 2. READ ALL: Lấy toàn bộ danh sách yêu thích
  async findAll(): Promise<Favourite[]> {
    return await this.favouriteRepository.find();
  }

  // 2b. READ ONE: Tìm xem một cặp User và Room cụ thể đã thích nhau chưa
  async findOne(userId: number, roomId: number): Promise<Favourite> {
    const favourite = await this.favouriteRepository.findOne({
      where: { userId, roomId },
    });
    if (!favourite) {
      throw new NotFoundException(`Không tìm thấy lượt lưu thích của User ${userId} với Room ${roomId}`);
    }
    return favourite;
  }

  // 3. DELETE: Xóa khỏi danh sách yêu thích (Hủy thích)
  async remove(userId: number, roomId: number): Promise<{ message: string }> {
    const favourite = await this.findOne(userId, roomId);
    await this.favouriteRepository.remove(favourite);
    return { message: `Đã xóa phòng ${roomId} khỏi danh sách yêu thích của User ${userId}` };
  }
}