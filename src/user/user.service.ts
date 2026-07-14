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
import { UpdateUserDto } from "./dto/update-user.dto"; 

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // 1. CREATE (Dành cho nội bộ/Admin)
  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(userData);
    return await this.userRepository.save(newUser);
  }

  // 2. READ ALL & READ ONE
  async findAll(): Promise<Omit<User, "password">[]> {
    const users = await this.userRepository.find();
    return users.map(({ password, ...result }) => result);
  }

  async findOne(id: number): Promise<Omit<User, "password">> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }
    const { password, ...result } = user;
    return result;
  }

  // 3. UPDATE (Bảo mật tuyệt đối, tránh sửa đè id/role)
  async update(
    id: number,
    updateData: UpdateUserDto,
  ): Promise<Omit<User, "password">> {
    await this.findOne(id); // Kiểm tra tồn tại

    const { password, phone } = updateData;
    const dataToUpdate: any = {};

    if (phone) dataToUpdate.phone = phone;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      dataToUpdate.password = await bcrypt.hash(password, salt);
    }

    if (Object.keys(dataToUpdate).length > 0) {
      await this.userRepository.update(id, dataToUpdate);
    }
    
    return this.findOne(id);
  }

  // 4. DELETE
  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id);
    await this.userRepository.delete(id);
    return { message: `Xóa thành công người dùng có ID ${id}` };
  }

  // F01: ĐĂNG KÝ BẢO MẬT
  async register(userData: Partial<User>) {
    const { username, password, role, phone } = userData;

    if (!username || !password) {
      throw new BadRequestException(
        "Tên đăng nhập và mật khẩu không được bỏ trống",
      );
    }

    const userExist = await this.userRepository.findOne({
      where: { username },
    });
    if (userExist) throw new BadRequestException("Tên đăng nhập đã tồn tại");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const assignedRole = role || "Tenant";

    const newUser = this.userRepository.create({
      username,
      password: hashedPassword,
      role: assignedRole,
      currentMode: assignedRole, 
      phone,
    });

    const savedUser = await this.userRepository.save(newUser);
    const { password: _, ...userWithoutPassword } = savedUser;

    return {
      message: "Đăng ký thành công",
      user: userWithoutPassword,
    };
  }

  // F02: ĐĂNG NHẬP SINH JWT
  async login(userData: Partial<User>) {
    const { username, password } = userData;
    if (!username || !password) {
      throw new BadRequestException(
        "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu",
      );
    }

    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không đúng");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không đúng");
    }

    const payload = { 
      sub: user.id, 
      username: user.username, 
      role: user.role,
      currentMode: user.currentMode 
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      message: "Đăng nhập thành công",
      accessToken: accessToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        phone: user.phone,
        currentMode: user.currentMode,
      },
    };
  }

  // F03.2: CHUYỂN CHẾ ĐỘ VAI TRÒ (SWITCH MODE)
  async switchMode(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("Không tìm thấy người dùng");
    }

    user.currentMode = user.currentMode === "Tenant" ? "Landlord" : "Tenant";
    const updatedUser = await this.userRepository.save(user);

    return {
      message: `Đã chuyển sang chế độ ${updatedUser.currentMode === "Landlord" ? "Chủ nhà" : "Người thuê"}`,
      currentMode: updatedUser.currentMode,
    };
  }
}