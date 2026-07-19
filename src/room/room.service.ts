import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  // =========================================================================
  // [ZONE 1] KHU VỰC LOGIC CỦA TV1 (TRƯỞNG NHÓM - KIÊN)
  // Xử lý các nghiệp vụ: F10, F11, F12, F13
  // =========================================================================

  // F10: Tạo phòng trọ mới với trạng thái mặc định ban đầu là Available
  async create(landlordId: number, roomData: Partial<Room>): Promise<Room> {
    const newRoom = this.roomRepository.create({
      ...roomData,
      landlordId,
      status: roomData.status || 'Available',
    });
    return await this.roomRepository.save(newRoom);
  }

  // F11: Lấy danh sách phòng lọc theo landlord_id của chủ nhà hiện tại
  async findMyRooms(landlordId: number): Promise<Room[]> {
    return await this.roomRepository.find({
      where: { landlordId },
      order: { createdAt: 'DESC' },
    });
  }

  // Hàm hỗ trợ tìm phòng và kiểm tra quyền sở hữu bài đăng (Tránh việc chủ nhà sửa/xóa nhầm phòng người khác)
  private async findAndVerifyOwnership(id: number, landlordId: number): Promise<Room> {
    const room = await this.roomRepository.findOne({ where: { id } });
    if (!room) {
      throw new NotFoundException(`Không tìm thấy phòng trọ với ID ${id}`);
    }
    if (room.landlordId !== landlordId) {
      throw new ForbiddenException('Bạn không có quyền thao tác trên phòng trọ của người khác');
    }
    return room;
  }

  // F12: Cập nhật thông tin chi tiết phòng / Chuyển đổi trạng thái sang bảo trì
  async update(id: number, landlordId: number, updateData: Partial<Room>): Promise<Room> {
    await this.findAndVerifyOwnership(id, landlordId);
    await this.roomRepository.update(id, updateData);
    
    const updatedRoom = await this.roomRepository.findOne({ where: { id } });
    return updatedRoom!;
  }

  // F13: Xóa bài đăng phòng trọ
  async remove(id: number, landlordId: number): Promise<{ message: string }> {
    await this.findAndVerifyOwnership(id, landlordId);
    await this.roomRepository.delete(id);
    return { message: `Xóa thành công phòng trọ có ID ${id}` };
  }


  // =========================================================================
  // [ZONE 2] KHU VỰC LOGIC CỦA TV2
  // TV2 VUI LÒNG CHỈ THÊM CÁC PHƯƠNG THỨC CỦA BẠN TỪ DÒNG NÀY TRỞ XUỐNG DƯỚI
  // Các hàm cần viết: findAll, findOneDetail, searchRooms, uploadImages, deleteImage...
  // =========================================================================

}