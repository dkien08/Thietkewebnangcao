import { Entity, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('favourites')
export class Favourite {
  @PrimaryColumn({ name: 'user_id' })
  userId!: number;

  @PrimaryColumn({ name: 'room_id' })
  roomId!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}