import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { RoomImage } from './room-image.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) { }

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
  // F04: Lấy danh sách tất cả phòng trọ đang trống (status = Available), mới nhất lên đầu
  async findAllAvailable(): Promise<Room[]> {
    return await this.roomRepository.find({
      where: { status: 'Available' },
      relations: ['images'],
      order: { createdAt: 'DESC' },
    });
  }

  // F05: Xem chi tiết 1 phòng trọ (JOIN với room_images và landlord để lấy SĐT)
  async findOneDetail(id: number): Promise<Room> {
    const room = await this.roomRepository.createQueryBuilder('room')
      .leftJoinAndSelect('room.images', 'images')
      .leftJoin('room.landlord', 'landlord')
      .addSelect(['landlord.id', 'landlord.phone', 'landlord.username']) // Chỉ lấy thông tin SĐT & tên chủ nhà
      .where('room.id = :id', { id })
      .getOne();

    if (!room) {
      throw new NotFoundException(`Không tìm thấy phòng trọ với ID ${id}`);
    }

    return room;
  }

  // F06: Bộ lọc tìm kiếm nâng cao (QueryBuilder lọc động)
  async searchRooms(filters: any): Promise<Room[]> {
    const query = this.roomRepository.createQueryBuilder('room')
      .leftJoinAndSelect('room.images', 'images')
      .where('room.status = :status', { status: 'Available' });

    if (filters.district) {
      query.andWhere('room.district LIKE :district', { district: `%${filters.district}%` });
    }

    if (filters.minPrice) {
      query.andWhere('room.price >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters.maxPrice) {
      query.andWhere('room.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    if (filters.minArea) {
      query.andWhere('room.area >= :minArea', { minArea: filters.minArea });
    }

    if (filters.maxArea) {
      query.andWhere('room.area <= :maxArea', { maxArea: filters.maxArea });
    }

    if (filters.hasAc !== undefined) {
      query.andWhere('room.hasAc = :hasAc', { hasAc: filters.hasAc });
    }

    if (filters.hasWm !== undefined) {
      query.andWhere('room.hasWm = :hasWm', { hasWm: filters.hasWm });
    }

    return await query.orderBy('room.createdAt', 'DESC').getMany();
  }

  // F19: Thêm ảnh phòng trọ (Lưu URL vào DB)
  async addRoomImage(roomId: number, landlordId: number, imageUrl: string, publicId?: string) {
    await this.findAndVerifyOwnership(roomId, landlordId);

    const imageRepository = this.roomRepository.manager.getRepository(RoomImage);
    const newImage = imageRepository.create({
      roomId,
      imageUrl,
      publicId,
    });

    return await imageRepository.save(newImage);
  }

  // F20: Xóa lẻ 1 ảnh phòng trọ
  async deleteRoomImage(roomId: number, imageId: number, landlordId: number) {
    await this.findAndVerifyOwnership(roomId, landlordId);

    const imageRepository = this.roomRepository.manager.getRepository(RoomImage);
    const image = await imageRepository.findOne({ where: { id: imageId, roomId } });

    if (!image) {
      throw new NotFoundException(`Không tìm thấy ảnh với ID ${imageId} thuộc phòng ${roomId}`);
    }

    // Note: Thực hiện xóa file vật lý trên Cloudinary bằng publicId tại đây nếu tích hợp Cloudinary SDK

    await imageRepository.delete(imageId);
    return { message: `Xóa thành công ảnh có ID ${imageId}` };
  }
}