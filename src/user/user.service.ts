import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(userData);
    return await this.userRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user)
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    return user;
  }

  async update(id: number, updateData: UpdateUserDto | Partial<User>): Promise<User> {
    await this.findOne(id); 
    await this.userRepository.update(id, updateData);
    const updatedUser = await this.findOne(id);
    delete (updatedUser as any).password;
    return updatedUser;
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id);
    await this.userRepository.delete(id);
    return { message: `Xóa thành công người dùng có ID ${id}` };
  }

  async register(userData: Partial<User>): Promise<any> {
    const { username, password, role, phone } = userData;

    const userExist = await this.userRepository.findOne({ where: { username } });
    if (userExist) throw new BadRequestException("Tên đăng nhập đã tồn tại");
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password!, salt);
    
    const newUser = this.userRepository.create({
      username,
      password: hashedPassword,
      role: role || "Tenant",
      phone,
    });
    
    const savedUser = await this.userRepository.save(newUser);
    delete (savedUser as any).password;
    
    return { message: "Đăng ký thành công", user: savedUser };
  }

  async login(userData: Partial<User>) {
    const { username, password } = userData;
    if (!username || !password)
      throw new BadRequestException("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");

    const user = await this.userRepository.findOne({ where: { username } });
    if (!user)
      throw new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không đúng");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      throw new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không đúng");

    // 🔑 Payload đóng gói biến sub
    const payload = { sub: user.id, username: user.username, role: user.role };
    
    // ✅ ĐÃ SỬA LỖI TYPESCRIPT: Ép kiểu as any cho options để tránh lỗi Overload
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'fallback_jwt_secret_key_12345',
      expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as any,
    });

    return {
      message: "Đăng nhập thành công",
      accessToken,
      user: { id: user.id, username: user.username, role: user.role, phone: user.phone },
    };
  }

  async switchMode(id: number): Promise<{ message: string; currentRole: string }> {
    const user = await this.findOne(id);
    if (user.role === "Admin") {
      throw new BadRequestException("Không thể chuyển đổi vai trò cho tài khoản Admin");
    }
    user.role = user.role === "Tenant" ? "Landlord" : "Tenant";
    await this.userRepository.save(user);
    return { message: `Chuyển đổi sang vai trò ${user.role} thành công`, currentRole: user.role };
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword } = changePasswordDto;
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException("Không tìm thấy người dùng");

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new BadRequestException("Mật khẩu cũ không chính xác");

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await this.userRepository.save(user);

    return { message: "Đổi mật khẩu thành công!" };
  }
}