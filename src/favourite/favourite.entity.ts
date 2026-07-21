import { Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Room } from '../room/room.entity'; // Chỉnh lại đường dẫn nếu cần

@Entity('favourites')
export class Favourite {
  @PrimaryColumn({ name: 'user_id' })
  userId!: number;

  @PrimaryColumn({ name: 'room_id' })
  roomId!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Thiết lập quan hệ để JOIN lấy thông tin phòng trọ
  @ManyToOne(() => Room, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room!: Room;
}