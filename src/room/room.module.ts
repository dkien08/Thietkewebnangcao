import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { RoomImage } from './room-image.entity';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { Contract } from '../contract/contract.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, RoomImage,Contract])], 
  providers: [RoomService],
  controllers: [RoomController],
  exports: [RoomService],
})
export class RoomModule {}