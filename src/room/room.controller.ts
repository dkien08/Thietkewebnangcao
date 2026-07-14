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
  create(@Body() roomData: Partial<Room>) {
    return this.roomService.create(roomData);
  }

  @Get()
  findAll() {
    return this.roomService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.roomService.findOne(+id);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() updateData: Partial<Room>) {
    return this.roomService.update(+id, updateData);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.roomService.remove(+id);
  }
}
