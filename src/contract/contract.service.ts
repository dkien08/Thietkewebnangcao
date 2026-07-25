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
  async createContract(tenantId: number, dto: CreateContractDto): Promise<Contract> {
    const room = await this.roomRepository.findOne({ where: { id: dto.roomId } });

    if (!room) {
      throw new NotFoundException('Phòng trọ không tồn tại');
    }

    if (room.status !== 'Available') {
      throw new BadRequestException('Phòng trọ này hiện không trống để đăng ký thuê');
    }

    const existingRequest = await this.contractRepository.findOne({
      where: {
        tenantId,
        roomId: dto.roomId,
        status: ContractStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException('Bạn đã gửi yêu cầu thuê phòng này rồi, vui lòng chờ chủ nhà phê duyệt');
    }

    const newContract = this.contractRepository.create({
      tenantId,
      roomId: dto.roomId,
      startDate: dto.startDate,
      endDate: dto.endDate,
      price: dto.price || room.price,
      status: ContractStatus.PENDING,
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

  // F14: Danh sách phòng chờ duyệt cho Landlord
  async findByLandlord(landlordId: number): Promise<Contract[]> {
    return await this.contractRepository
      .createQueryBuilder('contract')
      .innerJoinAndSelect('contract.room', 'room')
      .innerJoinAndSelect('contract.tenant', 'tenant')
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