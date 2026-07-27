import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Contract, ContractStatus } from './contract.entity';
import { Room } from '../room/room.entity';
import { CreateContractDto } from './dto/contract.dto';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    private dataSource: DataSource,
  ) {}

  // F08: Tenant gửi yêu cầu thuê phòng
  async createContract(tenantIdInput: number | string, dto: CreateContractDto): Promise<Contract> {
    const tenantId = Number(tenantIdInput);
    const roomId = Number(dto.roomId);

    // 1. Kiểm tra phòng trọ có tồn tại không
    const room = await this.roomRepository.findOne({ where: { id: roomId } });
    if (!room) {
      throw new NotFoundException('Không tìm thấy phòng trọ này');
    }

    // 2. Kiểm tra trạng thái phòng
    if (room.status !== 'Available') {
      throw new BadRequestException('Phòng trọ này hiện không còn trống');
    }

    // 3. Kiểm tra xem người gửi có phải chính chủ nhà đăng phòng không
    if (Number(room.landlordId) === tenantId) {
      throw new BadRequestException('Bạn không thể gửi yêu cầu thuê phòng do chính mình quản lý');
    }

    // 4. Kiểm tra trùng lặp yêu cầu thuê phòng
    const existingContract = await this.contractRepository.findOne({
      where: [
        { tenantId, roomId, status: ContractStatus.PENDING },
        { tenantId, roomId, status: ContractStatus.ACTIVE },
      ],
    });

    if (existingContract) {
      throw new BadRequestException('Bạn đã gửi yêu cầu thuê phòng này rồi, vui lòng chờ chủ nhà xử lý.');
    }

    // 5. Ép kiểu dữ liệu an toàn trước khi lưu TypeORM
    const finalPrice = dto.price ? Number(dto.price) : Number(room.price);

    const newContract = this.contractRepository.create({
  tenantId,
  roomId,
  endDate: new Date(dto.endDate), // Chỉ lưu endDate đúng theo cấu trúc DB của bạn
  price: finalPrice,
  status: ContractStatus.PENDING, // Trạng thái 'PENDING' viết hoa
});

return await this.contractRepository.save(newContract);
  }

  // F09: Danh sách hợp đồng của Tenant
  async findByTenant(tenantId: number): Promise<Contract[]> {
    return await this.contractRepository.find({
      where: { tenantId },
      relations: ['room', 'room.images'],
      order: { createdAt: 'DESC' },
    });
  }
  async getMyActiveContract(tenantId: number) {
  const contract = await this.contractRepository.findOne({
    where: [
      { tenantId, status: ContractStatus.ACTIVE },  // ✅ Dùng Enum
      { tenantId, status: ContractStatus.PENDING }, // ✅ Dùng Enum
    ],
    relations: ['room', 'room.landlord'],
    order: { id: 'DESC' },
  });

  return contract || null;
}

 // F14: Lấy tất cả hợp đồng thuộc các phòng của Landlord (Dùng cho trang Quản lý Hợp đồng & Thống kê)
// F14: Lấy tất cả hợp đồng thuộc các phòng của Landlord
async findByLandlord(landlordIdInput: number | string): Promise<Contract[]> {
  const landlordId = Number(landlordIdInput);
  console.log('👉 [DEBUG CONTRACT SERVICE] Querying contracts for Landlord ID:', landlordId);

  if (!landlordId || isNaN(landlordId)) {
    console.warn('⚠️ [DEBUG] landlordId không hợp lệ (NaN/undefined)!');
    return [];
  }

  return await this.contractRepository
    .createQueryBuilder('contract')
    .leftJoinAndSelect('contract.room', 'room')    // Dùng leftJoin thay cho innerJoin để tránh mất bản ghi
    .leftJoinAndSelect('contract.tenant', 'tenant')  // Dùng leftJoin để an toàn
    .where('room.landlordId = :landlordId', { landlordId })
    .orderBy('contract.createdAt', 'DESC')
    .getMany();
}

  // F15: Landlord Phê duyệt hợp đồng (Đổi status hợp đồng -> Active, phòng -> Rented)
  async approveContract(id: number, landlordId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const contract = await queryRunner.manager.findOne(Contract, {
        where: { id },
        relations: ['room'],
      });

      if (!contract) {
        throw new NotFoundException('Không tìm thấy hợp đồng');
      }

      if (contract.room?.landlordId !== landlordId) {
        throw new ForbiddenException('Bạn không phải chủ sở hữu của phòng trọ này');
      }

      if (contract.status !== ContractStatus.PENDING) {
        throw new BadRequestException('Chỉ có thể phê duyệt hợp đồng đang ở trạng thái Pending');
      }

      contract.status = ContractStatus.ACTIVE;
      await queryRunner.manager.save(contract);

      contract.room.status = 'Rented';
      await queryRunner.manager.save(contract.room);

      await queryRunner.commitTransaction();
      return { message: 'Phê duyệt hợp đồng thành công', contract };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // F15.1: Landlord Từ chối yêu cầu
  async rejectContract(id: number, landlordId: number) {
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: ['room'],
    });

    if (!contract) {
      throw new NotFoundException('Không tìm thấy hợp đồng');
    }

    if (contract.room?.landlordId !== landlordId) {
      throw new ForbiddenException('Bạn không phải chủ sở hữu của phòng trọ này');
    }

    if (contract.status !== ContractStatus.PENDING) {
      throw new BadRequestException('Chỉ có thể từ chối hợp đồng đang ở trạng thái Pending');
    }

    contract.status = ContractStatus.REJECTED;
    return await this.contractRepository.save(contract);
  }

  // F17: Hủy/Kết thúc hợp đồng (Trả lại phòng thành Available)
  async terminateContract(id: number, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const contract = await queryRunner.manager.findOne(Contract, {
        where: { id },
        relations: ['room'],
      });

      if (!contract) {
        throw new NotFoundException('Không tìm thấy hợp đồng');
      }

      const isTenant = contract.tenantId === userId;
      const isLandlord = contract.room?.landlordId === userId;

      if (!isTenant && !isLandlord) {
        throw new ForbiddenException('Bạn không có quyền chấm dứt hợp đồng này');
      }

      contract.status = ContractStatus.TERMINATED;
      await queryRunner.manager.save(contract);

      if (contract.room) {
        contract.room.status = 'Available';
        await queryRunner.manager.save(contract.room);
      }

      await queryRunner.commitTransaction();
      return { message: 'Đã kết thúc hợp đồng và giải phóng phòng thành công' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}