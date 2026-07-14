import { IsString, Length, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @Length(6, 255, { message: 'Mật khẩu phải từ 6 đến 255 ký tự' })
  password?: string;

  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @Length(10, 15, { message: 'Số điện thoại hợp lệ phải từ 10 đến 15 số' })
  phone?: string;
}