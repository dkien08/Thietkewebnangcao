import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { Room } from '../room/room.entity';
import { Contract } from '../contract/contract.entity';
import { User } from '../user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, Contract, User]), // Đã thêm User
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}