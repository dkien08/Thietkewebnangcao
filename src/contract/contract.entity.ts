// File: src/contract/contract.entity.ts
import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  ManyToOne, 
  JoinColumn,
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { User } from '../user/user.entity';
import { Room } from '../room/room.entity';

// Enum status KHỚP 100% VỚI DATABASE
export enum ContractStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
  REJECTED = 'REJECTED',
}

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tenant_id' })
  tenantId: number;

  @Column({ name: 'room_id' })
  roomId: number;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', name: 'endDate' })
  endDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.PENDING,
  })
  status: ContractStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // --- QUAN HỆ (RELATIONS) ---
  @ManyToOne(() => User)
  @JoinColumn({ name: 'tenant_id' })
  tenant: User;

  @ManyToOne(() => Room)
  @JoinColumn({ name: 'room_id' })
  room: Room;
}