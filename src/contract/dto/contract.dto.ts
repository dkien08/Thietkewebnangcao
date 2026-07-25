import { IsNotEmpty, IsNumber, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContractDto {
  @IsNotEmpty({ message: 'Mã phòng trọ không được để trống' })
  @IsNumber({}, { message: 'roomId phải là số' })
  roomId!: number;

  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  @Type(() => Date) 
  @IsDate({ message: 'Ngày bắt đầu không đúng định dạng ngày hợp lệ' })
  startDate!: Date;

  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
  @Type(() => Date)
  @IsDate({ message: 'Ngày kết thúc không đúng định dạng ngày hợp lệ' })
  endDate!: Date;

  @IsOptional()
  @IsNumber({}, { message: 'Giá tiền phải là số' })
  price?: number;
}