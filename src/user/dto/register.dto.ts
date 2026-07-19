import { IsNotEmpty, IsString, Length, IsOptional, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'Tên đăng nhập phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên đăng nhập không được bỏ trống' })
  @Length(3, 50, { message: 'Tên đăng nhập phải từ 3 đến 50 ký tự' })
  username!: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mật khẩu không được bỏ trống' })
  @Length(6, 20, { message: 'Mật khẩu phải từ 6 đến 20 ký tự' })
  password!: string;

  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Số điện thoại không được bỏ trống' })
  phone!: string;

  @IsOptional() // Không bắt buộc gửi lên, nếu không gửi sẽ lấy default
  @IsEnum(['Tenant', 'Landlord'], { message: 'Vai trò phải là Tenant hoặc Landlord' })
  role?: string;
}