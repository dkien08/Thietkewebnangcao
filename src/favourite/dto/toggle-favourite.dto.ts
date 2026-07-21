import { IsNotEmpty, IsNumber } from 'class-validator';

export class ToggleFavouriteDto {
  @IsNotEmpty()
  @IsNumber()
  roomId!: number;
}