import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavouriteController } from './favourite.controller';
import { FavouriteService } from './favourite.service';
import { Favourite } from './favourite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Favourite])],
  controllers: [FavouriteController],
  providers: [FavouriteService],
})
export class FavouriteModule {}