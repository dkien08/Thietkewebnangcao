import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { RoomService } from "./room.service";
import { Room } from "./room.entity";

@Controller("rooms")
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  async create(@Body() roomData: Partial<Room>) {
    return await this.roomService.create(roomData);
  }

  @Get()
  async findAll() {
    return await this.roomService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return await this.roomService.findOne(+id);
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() updateData: Partial<Room>) {
    return await this.roomService.update(+id, updateData);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return await this.roomService.remove(+id);
  }
}
