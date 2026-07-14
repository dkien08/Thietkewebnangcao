import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { FavouriteService } from './favourite.service';
import { Favourite } from './favourite.entity';

@Controller('favourites')
export class FavouriteController {
  constructor(private readonly favouriteService: FavouriteService) {}

  @Post()
  create(@Body() favouriteData: Partial<Favourite>) {
    return this.favouriteService.create(favouriteData);
  }

  @Get()
  findAll() {
    return this.favouriteService.findAll();
  }

  @Get(':userId/:roomId')
  findOne(@Param('userId') userId: string, @Param('roomId') roomId: string) {
    return this.favouriteService.findOne(+userId, +roomId);
  }

  @Delete(':userId/:roomId')
  remove(@Param('userId') userId: string, @Param('roomId') roomId: string) {
    return this.favouriteService.remove(+userId, +roomId);
  }
}