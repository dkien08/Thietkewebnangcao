import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Room } from './room.entity';

@Entity('room_images')
export class RoomImage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'room_id' })
  roomId!: number;

  @Column({ type: 'text', name: 'image_url' })
  imageUrl!: string;

  @Column({ type: 'varchar', length: 255, name: 'public_id', nullable: true })
  publicId!: string; // Dùng để xóa file trên Cloudinary (nếu có)

  @ManyToOne(() => Room, (room) => room.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room!: Room;
}