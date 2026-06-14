import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'tenant_id' })
  tenantId!: number; // ID của khách thuê (User)

  @Column({ name: 'room_id' })
  roomId!: number; // ID của phòng trọ (Room)

  @Column({ type: 'date' })
  startDate!: string; // Ngày bắt đầu hợp đồng

  @Column({ type: 'date' })
  endDate!: string; // Ngày kết thúc hợp đồng

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number; // Giá thuê thỏa thuận trên hợp đồng

  @Column({ type: 'enum', enum: ['Active', 'Expired', 'Terminated'], default: 'Active' })
  status!: string; // Trạng thái hợp đồng
}