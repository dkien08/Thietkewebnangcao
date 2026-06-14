import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './contract.entity';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
  ) {}

  // 1. CREATE
  async create(contractData: Partial<Contract>): Promise<Contract> {
    const newContract = this.contractRepository.create(contractData);
    return await this.contractRepository.save(newContract);
  }

  // 2. READ ALL & READ ONE
  async findAll(): Promise<Contract[]> {
    return await this.contractRepository.find();
  }

  async findOne(id: number): Promise<Contract> {
    const contract = await this.contractRepository.findOne({ where: { id } });
    if (!contract) throw new NotFoundException(`Không tìm thấy hợp đồng với ID ${id}`);
    return contract;
  }

  // 3. UPDATE
  async update(id: number, updateData: Partial<Contract>): Promise<Contract> {
    await this.findOne(id); // Kiểm tra tồn tại trước khi sửa
    await this.contractRepository.update(id, updateData);
    return this.findOne(id);
  }

  // 4. DELETE
  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id); // Kiểm tra tồn tại trước khi xóa
    await this.contractRepository.delete(id);
    return { message: `Xóa thành công hợp đồng có ID ${id}` };
  }
}