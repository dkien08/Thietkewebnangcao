import { Controller, Get, Req } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // F16: Thống kê báo cáo dành cho chủ nhà
  @Get('landlord')
  async getLandlordReport(@Req() req: any) {
    const landlordId = req.user?.id || 1; // Mặc định là 1 để kiểm thử nếu chưa gắn AuthGuard
    return this.reportService.getLandlordReport(landlordId);
  }
}