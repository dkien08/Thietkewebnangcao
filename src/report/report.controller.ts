import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
// Import các Guard bảo mật nếu dự án của bạn đã cấu hình JWT & AdminGuard
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  /**
   * [F16] Thống kê báo cáo dành cho Chủ nhà (Landlord)
   * GET /api/reports/landlord
   */
  // @UseGuards(JwtAuthGuard)
  @Get('landlord')
  async getLandlordReport(@Req() req: any) {
    const landlordId = req.user?.id || 1; // Lấy ID chủ nhà từ JWT Token (fallback 1 khi dev)
    return this.reportService.getLandlordReport(landlordId);
  }

  /**
   * [F25] Báo cáo thống kê tổng quan toàn hệ thống dành cho Admin
   * GET /api/reports/admin
   */
  // @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin')
  async getAdminReport() {
    return this.reportService.getAdminReport();
  }
}