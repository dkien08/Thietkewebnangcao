import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Res,
  UseGuards,
  Req,
  ParseIntPipe,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RegisterDto } from "./dto/register.dto"; 
import { LoginDto } from "./dto/login.dto"; 
import { UpdateUserDto } from "./dto/update-user.dto"; 
import { Throttle } from "@nestjs/throttler"; 
import { AdminGuard } from "../common/guards/admin.guard";
import { ChangePasswordDto } from "./dto/change-password.dto"; 

@Controller("auth")
export class UserController {
  constructor(private readonly userService: UserService) {}

  // F01: Đăng ký tài khoản (Public)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post("register")
  register(@Body() userData: RegisterDto) {
    return this.userService.register(userData);
  }

  // F02: Đăng nhập & Tự động ghi Token vào HttpOnly Cookie (Public)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post("login")
  async login(
    @Body() userData: LoginDto, 
    @Res({ passthrough: true }) response: any,
  ) {
    const result = await this.userService.login(userData);

    // Ghi Cookie an toàn chống tấn công XSS
    response.cookie("access_token", result.accessToken, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "lax", 
      maxAge: 24 * 60 * 60 * 1000, 
    });

    // Ống bảo mật: Ẩn token thô khỏi response body trả về client
    const { accessToken, ...rest } = result;
    return rest; 
  }

  // F02.1: Đăng xuất (Xóa Cookie)
  @Post("logout")
  async logout(@Res({ passthrough: true }) response: any) {
    response.clearCookie("access_token");
    return { message: "Đăng xuất thành công" };
  }

  // F03: Xem profile của chính người đang đăng nhập
  @Get("profile")
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    // SỬA: Dùng req.user.sub để lấy đúng ID giải mã từ Token
    return this.userService.findOne(req.user.sub);
  }

  // F03.1: Sửa profile của chính mình
  @Put("profile")
  @UseGuards(JwtAuthGuard)
  updateProfile(@Req() req: any, @Body() updateData: UpdateUserDto) {
    // SỬA: Dùng req.user.sub
    return this.userService.update(req.user.sub, updateData); 
  }

  // F03.2: Bật/Tắt chế độ vai trò hiện tại (Tenant <-> Landlord)
  @Put("switch-mode")
  @UseGuards(JwtAuthGuard)
  async switchMode(@Req() req: any) {
    // SỬA: Dùng req.user.sub
    return this.userService.switchMode(req.user.sub);
  }

  // F03.3: API Đổi mật khẩu an toàn
  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Req() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    // SỬA: Dùng req.user.sub
    return this.userService.changePassword(req.user.sub, changePasswordDto);
  }

  // --- Các API Quản trị hệ thống (Admin/Nội bộ) ---
  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAll() {
    return this.userService.findAll();
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  findOne(@Param("id", ParseIntPipe) id: number) { // SỬA: Thêm ParseIntPipe
    return this.userService.findOne(id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param("id", ParseIntPipe) id: number, @Body() updateData: UpdateUserDto) { // SỬA: Thêm ParseIntPipe
    return this.userService.update(id, updateData);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param("id", ParseIntPipe) id: number) { // SỬA: Thêm ParseIntPipe
    return this.userService.remove(id);
  }
}