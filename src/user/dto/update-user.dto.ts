import { IsString, Length, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @Length(10, 15, { message: 'Số điện thoại hợp lệ phải từ 10 đến 15 số' })
  phone?: string;
}