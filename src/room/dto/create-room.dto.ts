// src/room/dto/create-room.dto.ts
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateRoomDto {
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: 'Giá phòng không được để trống' })
  @IsNumber()
  price!: number;

  @IsNotEmpty({ message: 'Diện tích không được để trống' })
  @IsNumber()
  area!: number;

  @IsNotEmpty({ message: 'Quận không được để trống' })
  @IsString()
  district!: string;

  @IsNotEmpty({ message: 'Địa chỉ chi tiết không được để trống' })
  @IsString()
  addressDetail!: string;

  @IsOptional()
  @IsBoolean()
  hasAc?: boolean;

  @IsOptional()
  @IsBoolean()
  hasWm?: boolean;
}