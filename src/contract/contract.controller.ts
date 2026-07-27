import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/contract.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'; // Đổi đường dẫn cho khớp với dự án của bạn

@Controller('contracts')
@UseGuards(JwtAuthGuard)
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  // Hàm hỗ trợ lấy User ID từ Request an toàn (Chống undefined)
  private getUserId(req: any): number {
  const userId = req.user?.sub ?? req.user?.userId ?? req.user?.id;
  console.log('👉 [DEBUG CONTRACT CONTROLLER] Payload User từ JWT Token:', req.user);
  console.log('👉 [DEBUG CONTRACT CONTROLLER] Parsed User ID:', userId);
  return Number(userId);
}

  // F08: POST /api/contracts (Tenant tạo yêu cầu thuê phòng)
  @Post()
  create(@Req() req: any, @Body() dto: CreateContractDto) {
    const tenantId = this.getUserId(req);
    return this.contractService.createContract(tenantId, dto);
  }

  // F09: GET /api/contracts/tenant (Tenant xem danh sách hợp đồng của mình)
  @Get('tenant')
  getTenantContracts(@Req() req: any) {
    const tenantId = this.getUserId(req);
    return this.contractService.findByTenant(tenantId);
  }

  // F14: GET /api/contracts/landlord (Landlord xem các yêu cầu gửi đến phòng mình)
  @Get('landlord')
  getLandlordContracts(@Req() req: any) {
    const landlordId = this.getUserId(req);
    return this.contractService.findByLandlord(landlordId);
  }

  // F15: PUT /api/contracts/:id/approve (Landlord duyệt hợp đồng)
  @Put(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const landlordId = this.getUserId(req);
    return this.contractService.approveContract(id, landlordId);
  }

  // F15.1: PUT /api/contracts/:id/reject (Landlord từ chối hợp đồng)
  @Put(':id/reject')
  reject(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const landlordId = this.getUserId(req);
    return this.contractService.rejectContract(id, landlordId);
  }

  // F17: PUT /api/contracts/:id/terminate (Landlord / Tenant chấm dứt hợp đồng)
  @Put(':id/terminate')
  terminate(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = this.getUserId(req);
    return this.contractService.terminateContract(id, userId);
  }
  @Get('my-active')
@UseGuards(JwtAuthGuard)
async getMyActiveContract(@Req() req: any) {
  const tenantId = this.getUserId(req);
  return this.contractService.getMyActiveContract(tenantId);
}
}