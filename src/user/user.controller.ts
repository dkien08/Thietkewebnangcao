import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AdminGuard } from "../common/guards/admin.guard";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  // F03: Xem profile bản thân -> GET /api/users/profile
  @Get("profile")
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    return this.userService.findOne(req.user.sub);
  }

  // F03.1: Sửa profile bản thân -> PUT /api/users/profile
  @Put("profile")
  @UseGuards(JwtAuthGuard)
  updateProfile(@Req() req: any, @Body() updateData: UpdateUserDto) {
    return this.userService.update(req.user.sub, updateData);
  }

  // F03.2: Chuyển đổi chế độ (Tenant <-> Landlord) -> PUT /api/users/switch-mode
  @Put("switch-mode")
  @UseGuards(JwtAuthGuard)
  async switchMode(@Req() req: any) {
    return this.userService.switchMode(req.user.sub);
  }

  // --- Các API Quản trị hệ thống (Chỉ Admin) ---

  // GET /api/users
  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAll() {
    return this.userService.findAll();
  }

  // GET /api/users/:id
  @Get(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  // PUT /api/users/:id
  @Put(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateData: UpdateUserDto,
  ) {
    return this.userService.update(id, updateData);
  }

  // DELETE /api/users/:id
  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}