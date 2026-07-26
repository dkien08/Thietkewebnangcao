import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

export enum ContractStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
}

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'tenant_id' })
  tenantId!: number;

  @Column({ name: 'room_id' })
  roomId!: number;

  // 🔴 Đã sửa: Thêm nullable: true để tránh lỗi khi TypeORM alter table
  @Column({ type: 'date', nullable: true })
  startDate!: string;

  // 🔴 Đã sửa: Thêm nullable: true
  @Column({ type: 'date', nullable: true })
  endDate!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.PENDING,
  })
  status!: ContractStatus;
}