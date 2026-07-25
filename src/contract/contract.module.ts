import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from './contract.entity';
import { Room } from '../room/room.entity'; // Đổi đường dẫn tới Room Entity
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Contract, Room])],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}