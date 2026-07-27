import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomImage } from './room-image.entity';
import { Contract, ContractStatus } from '../contract/contract.entity';
import { Favourite } from '../favourite/favourite.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,

    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    
    @InjectRepository(Favourite)
    private favouriteRepository: Repository<Favourite>,
  ) { }

  // =========================================================================
  // [ZONE 1] KHU VỰC LOGIC CỦA TV1 (TRƯỞNG NHÓM - KIÊN)
  // Xử lý các nghiệp vụ: F10, F11, F12, F13
  // =========================================================================

  // F10: Tạo phòng trọ mới với trạng thái mặc định ban đầu là Available
  async create(createRoomDto: CreateRoomDto, landlordId: number): Promise<Room> {
  // 🟢 Gán landlordId vào đối tượng room chuẩn bị lưu vào DB
  const newRoom = this.roomRepository.create({
    ...createRoomDto,
    landlordId: Number(landlordId), // Đảm bảo ép kiểu số
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

  // Hàm hỗ trợ tìm phòng và kiểm tra quyền sở hữu bài đăng
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

  // F12: Cập nhật thông tin chi tiết phòng
  async update(id: number, landlordId: number, updateData: Partial<Room>): Promise<Room> {
    await this.findAndVerifyOwnership(id, landlordId);
    await this.roomRepository.update(id, updateData);

    const updatedRoom = await this.roomRepository.findOne({ where: { id } });
    return updatedRoom!;
  }

  async remove(roomId: number, landlordId: number) {
  // 1. Kiểm tra xem phòng có tồn tại và thuộc quyền sở hữu của Landlord không
  const room = await this.roomRepository.findOne({
    where: { id: roomId, landlordId },
  });

  if (!room) {
    throw new NotFoundException('Không tìm thấy phòng trọ hoặc bạn không có quyền xóa');
  }

  // 2. Xóa các hợp đồng liên quan trong bảng contracts trước (tránh lỗi khóa ngoại)
  await this.contractRepository.delete({ roomId });

  // 3. Xóa các bản ghi yêu thích liên quan trong bảng favourites (nếu có)
  await this.favouriteRepository.delete({ roomId });

  // 4. Tiến hành xóa phòng trọ
  return await this.roomRepository.remove(room);
}

  // =========================================================================
  // [ZONE 2] KHU VỰC LOGIC CỦA TV2
  // =========================================================================

  // F04: Lấy danh sách tất cả phòng trọ đang trống
  async findAllAvailable(): Promise<Room[]> {
    return await this.roomRepository.find({
      where: { status: 'Available' },
      relations: ['images'],
      order: { createdAt: 'DESC' },
    });
  }

  // 🟢 BỔ SUNG MỚI: Lấy phòng trọ đang được thuê thực tế của Tenant (Đã được phẳng hóa)
  async findActiveRoomByTenantId(tenantId: number | string) {
    const numericTenantId = Number(tenantId); // Ép kiểu về number để khớp DB

    const activeContract = await this.contractRepository.findOne({
      where: {
        tenantId: numericTenantId,
        status: ContractStatus.ACTIVE,
      },
    });

    if (!activeContract) {
      return null;
    }

    const room = await this.roomRepository.findOne({
      where: { id: activeContract.roomId },
      relations: ['images'],
    });

    if (!room) return null;

    // Phẳng hóa dữ liệu: Kết hợp thuộc tính của Room và Contract thành 1 Object
    return {
      ...room,
      contractId: activeContract.id,
      startDate: activeContract.startDate,
      endDate: activeContract.endDate,
      monthlyPrice: activeContract.price || room.price,
    };
  }

  // F05: Xem chi tiết 1 phòng trọ
  async findOneDetail(id: number): Promise<Room> {
    const room = await this.roomRepository.createQueryBuilder('room')
      .leftJoinAndSelect('room.images', 'images')
      .leftJoin('room.landlord', 'landlord')
      .addSelect(['landlord.id', 'landlord.phone', 'landlord.username'])
      .where('room.id = :id', { id })
      .getOne();

    if (!room) {
      throw new NotFoundException(`Không tìm thấy phòng trọ với ID ${id}`);
    }

    return room;
  }

  // F06: Bộ lọc tìm kiếm nâng cao
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

  // F19: Thêm ảnh phòng trọ
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

    await imageRepository.delete(imageId);
    return { message: `Xóa thành công ảnh có ID ${imageId}` };
  }
}