import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Res,
  Session,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.entity";

@Controller("auth")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("register")
  register(@Body() userData: Partial<User>) {
    return this.userService.register(userData);
  }

  @Post("login")
  async login(
    @Body() userData: Partial<User>,
    @Res({ passthrough: true }) response: any,
    @Session() session: Record<string, any>,
  ) {
    const result = await this.userService.login(userData);
    response.cookie("access_token", result.accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    session.userId = result.user.id;
    session.userRole = result.user.role;
    return result;
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(+id);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() updateData: Partial<User>) {
    return this.userService.update(+id, updateData);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.userService.remove(+id);
  }
}
