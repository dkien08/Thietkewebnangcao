import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'landlord_id' })
  landlordId!: number; // Liên kết với users.id (Xác định ai là chủ nhà)

  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  area!: number;

  @Column({ length: 100 })
  district!: string;

  @Column({ type: 'text', name: 'address_detail' })
  addressDetail!: string;

  @Column({ type: 'boolean', name: 'has_ac', default: false })
  hasAc!: boolean;

  @Column({ type: 'boolean', name: 'has_wm', default: false })
  hasWm!: boolean;

  @Column({ type: 'enum', enum: ['Available', 'Rented', 'Maintenance'], default: 'Available' })
  status!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}