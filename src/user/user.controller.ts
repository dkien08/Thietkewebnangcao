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
import { RegisterDto } from "./dto/register.dto"; // 1. Import DTO Đăng ký
import { LoginDto } from "./dto/login.dto"; // 2. Import DTO Đăng nhập
import { UpdateUserDto } from "./dto/update-user.dto"; // 3. Import DTO Cập nhật
import { Throttle } from "@nestjs/throttler"; // 4. Import Throttle để giới hạn số lần gọi API
import { AdminGuard } from "../common/guards/admin.guard";
import { ChangePasswordDto } from "./dto/change-password.dto"; // 5. Import DTO Đổi mật khẩu

@Controller("auth")
export class UserController {
  constructor(private readonly userService: UserService) {}

  // F01: Đăng ký tài khoản (Public)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post("register")
  register(@Body() userData: RegisterDto) {
    // Áp dụng RegisterDto
    return this.userService.register(userData);
  }

  // F02: Đăng nhập & Tự động ghi Token vào HttpOnly Cookie (Public)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post("login")
  async login(
    @Body() userData: LoginDto, // Áp dụng LoginDto
    @Res({ passthrough: true }) response: any,
  ) {
    const result = await this.userService.login(userData);

    // Ghi Cookie an toàn chống tấn công XSS
    response.cookie("access_token", result.accessToken, {
      httpOnly: true, // Frontend JS không thể truy cập, chống đánh cắp token
      secure: process.env.NODE_ENV === "production", // Chỉ gửi qua HTTPS khi deploy thật
      sameSite: "lax", // Hỗ trợ chia sẻ cookie an toàn
      maxAge: 24 * 60 * 60 * 1000, // Hết hạn sau 1 ngày
    });

    return result;
  }

  // F02.1: Đăng xuất (Xóa Cookie)
  @Post("logout")
  async logout(@Res({ passthrough: true }) response: any) {
    response.clearCookie("access_token");
    return { message: "Đăng xuất thành công" };
  }

  // F03: Xem profile của chính người đang đăng nhập (Yêu cầu JWT)
  @Get("profile")
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    // req.user được điền tự động bởi JwtStrategy sau khi giải mã token thành công
    return this.userService.findOne(req.user.userId);
  }

  // F03.1: Sửa profile của chính mình (Chỉ sửa phone, v.v. - Yêu cầu JWT)
  @Put("profile")
  @UseGuards(JwtAuthGuard)
  updateProfile(@Req() req: any, @Body() updateData: UpdateUserDto) {
    return this.userService.update(req.user.userId, updateData); // An tâm không bị lộ sửa đè password
  }

  // F03.2: Bật/Tắt chế độ vai trò hiện tại (Yêu cầu JWT)
  @Put("switch-mode")
  @UseGuards(JwtAuthGuard)
  async switchMode(@Req() req: any) {
    // req.user.userId được điền tự động bởi JwtStrategy
    return this.userService.switchMode(req.user.userId);
  }

  // 👉 F03.3: API Đổi mật khẩu an toàn (Yêu cầu JWT)
  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Req() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    // req.user.userId được điền tự động bởi JwtStrategy
    return this.userService.changePassword(req.user.userId, changePasswordDto);
  }

  // --- Các API Quản trị hệ thống (Admin/Nội bộ) ---
  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAll() {
    return this.userService.findAll();
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  findOne(@Param("id") id: number) {
    return this.userService.findOne(id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param("id") id: number, @Body() updateData: UpdateUserDto) {
    return this.userService.update(id, updateData);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param("id") id: number) {
    return this.userService.remove(id);
  }
}
