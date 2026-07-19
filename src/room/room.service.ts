import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  // 1. CREATE (Tạo phòng trọ mới)
  async create(roomData: Partial<Room>): Promise<Room> {
    const newRoom = this.roomRepository.create(roomData);
    return await this.roomRepository.save(newRoom);
  }

  // 2. READ (Lấy danh sách tất cả phòng và lấy chi tiết 1 phòng)
  async findAll(): Promise<Room[]> {
    return await this.roomRepository.find();
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomRepository.findOne({ where: { id } });
    if (!room) throw new NotFoundException(`Không tìm thấy phòng trọ với ID ${id}`);
    return room;
  }

  // 3. UPDATE (Cập nhật thông tin phòng)
  async update(id: number, updateData: Partial<Room>): Promise<Room> {
    await this.findOne(id); // Kiểm tra phòng có tồn tại không
    await this.roomRepository.update(id, updateData);
    return this.findOne(id);
  }

  // 4. DELETE (Xóa phòng trọ)
  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id); // Kiểm tra phòng có tồn tại không
    await this.roomRepository.delete(id);
    return { message: `Xóa thành công phòng trọ có ID ${id}` };
  }
}