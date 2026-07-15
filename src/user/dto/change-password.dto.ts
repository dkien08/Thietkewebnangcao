import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'Mật khẩu cũ phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mật khẩu cũ không được bỏ trống' })
  oldPassword!: string;

  @IsString({ message: 'Mật khẩu mới phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mật khẩu mới không được bỏ trống' })
  @Length(6, 20, { message: 'Mật khẩu mới phải từ 6 đến 20 ký tự' })
  newPassword!: string;
}