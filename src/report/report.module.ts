import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { Room } from '../room/room.entity';
import { Contract } from '../contract/contract.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, Contract])],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}