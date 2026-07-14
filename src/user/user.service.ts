import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
    if (!user) throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
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
    await this.findOne(id); // Kiểm tra tồn tại
    await this.userRepository.delete(id);
    return { message: `Xóa thành công người dùng có ID ${id}` };
  }
}