import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Room } from '../room/room.entity';

export enum ContractStatus {
  PENDING = 'Pending',
  ACTIVE = 'Active',
  REJECTED = 'Rejected',
  EXPIRED = 'Expired',
  TERMINATED = 'Terminated',
}


@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn()
  id: number;

  
  @Column({ name: 'tenant_id' })
  tenantId: number;

  @Column({ name: 'room_id' })
  roomId: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column('decimal')
  price: number;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.PENDING,
  })
  status: ContractStatus;

  // 3. Khai báo ánh xạ cho createdAt và updatedAt
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