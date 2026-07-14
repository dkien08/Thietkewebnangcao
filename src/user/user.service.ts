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
import bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // 1. CREATE
  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(userData);
    return await this.userRepository.save(newUser);
  }

  // 2. READ ALL & READ ONE
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user)
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    return user;
  }

  // 3. UPDATE
  async update(id: number, updateData: Partial<User>): Promise<User> {
    await this.findOne(id); // Kiểm tra tồn tại
    await this.userRepository.update(id, updateData);
    return this.findOne(id);
  }

  // 4. DELETE
  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id);
    await this.userRepository.delete(id);
    return { message: `Xóa thành công người dùng có ID ${id}` };
  }
  async register(userData: Partial<User>): Promise<User> {
    const { username, password, role, phone } = userData;

    const userExist = await this.userRepository.findOne({
      where: { username },
    });
    if (userExist) throw new BadRequestException("Tên đăng nhập đã tồn tại");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = this.userRepository.create({
      username,
      password: hashedPassword,
      role: role || "Tenant",
      phone,
    });
    const savedUser = await this.userRepository.save(newUser);
    delete (savedUser as any).password;
    return {
      message: "Đăng ký thành công",
      user: savedUser,
    } as any;
  }
  async login(userData: Partial<User>) {
    const { username, password } = userData;
    if (!username || !password)
      throw new BadRequestException(
        "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu",
      );

    const user = await this.userRepository.findOne({ where: { username } });
    if (!user)
      throw new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không đúng");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      throw new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không đúng");

    const payload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    return {
      message: "Đăng nhập thành công",
      accessToken: accessToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        phone: user.phone,
      },
    };
  }
}
