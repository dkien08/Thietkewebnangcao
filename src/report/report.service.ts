import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../room/room.entity';
import { Contract } from '../contract/contract.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
  ) {}

  async getLandlordReport(landlordId: number) {
    // 1. Tính tổng số phòng của chủ nhà
    const totalRoomsResult = await this.roomRepository
      .createQueryBuilder('room')
      .select('COUNT(room.id)', 'count')
      .where('room.landlordId = :landlordId', { landlordId })
      .getRawOne();
    const totalRooms = parseInt(totalRoomsResult.count) || 0;

    // 2. Tính số phòng đã được thuê (Trạng thái 'Rented')
    const rentedRoomsResult = await this.roomRepository
      .createQueryBuilder('room')
      .select('COUNT(room.id)', 'count')
      .where('room.landlordId = :landlordId AND room.status = :status', { landlordId, status: 'Rented' })
      .getRawOne();
    const rentedRooms = parseInt(rentedRoomsResult.count) || 0;

    // 3. Tính tỷ lệ lấp đầy (%)
    const rentalRate = totalRooms > 0 ? parseFloat(((rentedRooms / totalRooms) * 100).toFixed(2)) : 0;

    // 4. Tính tổng doanh thu dự kiến hàng tháng từ các hợp đồng 'Active' của chủ nhà
    const revenueResult = await this.contractRepository
      .createQueryBuilder('contract')
      .innerJoin('rooms', 'room', 'contract.room_id = room.id') // JOIN với bảng rooms qua room_id
      .select('SUM(contract.price)', 'total')
      .where('room.landlord_id = :landlordId AND contract.status = :status', { landlordId, status: 'Active' })
      .getRawOne();
    const expectedMonthlyRevenue = parseFloat(revenueResult.total) || 0;

    return {
      landlordId,
      totalRooms,
      rentedRooms,
      rentalRate: `${rentalRate}%`,
      expectedMonthlyRevenue,
    };
  }
}