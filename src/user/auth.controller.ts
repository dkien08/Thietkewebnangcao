import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { UserService } from "./user.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { Throttle } from "@nestjs/throttler";

@Controller("auth")
export class AuthController {
  constructor(private readonly userService: UserService) {}

  // F01: Đăng ký tài khoản (Public) -> POST /api/auth/register
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post("register")
  register(@Body() userData: RegisterDto) {
    return this.userService.register(userData);
  }

  // F02: Đăng nhập -> POST /api/auth/login
  // Trả thẳng accessToken về JSON Body để Frontend lưu LocalStorage/Memory
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post("login")
  async login(@Body() userData: LoginDto) {
    return this.userService.login(userData);
  }

  // F02.1: Đăng xuất -> POST /api/auth/logout
  @Post("logout")
  async logout() {
    return { message: "Đăng xuất thành công" };
  }

  // F03.3: API Đổi mật khẩu -> POST /api/auth/change-password
  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Req() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(req.user.sub, changePasswordDto);
  }
}