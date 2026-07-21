import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavouriteService } from './favourite.service';
import { Favourite } from './favourite.entity';
import { NotFoundException } from '@nestjs/common';

describe('FavouriteService', () => {
  let service: FavouriteService;
  let favouriteRepository: Repository<Favourite>;

  const mockFavouriteRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(jest.fn(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavouriteService,
        {
          provide: getRepositoryToken(Favourite),
          useValue: mockFavouriteRepository,
        },
      ],
    }).compile();

    service = module.get<FavouriteService>(FavouriteService);
    favouriteRepository = module.get<Repository<Favourite>>(getRepositoryToken(Favourite));
  }));

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('toggleFavourite', () => {
    it('nên xoá khỏi danh sách yêu thích nếu đã tồn tại bản ghi (Bỏ lưu)', async () => {
      const existingFav = { userId: 1, roomId: 10 } as Favourite;
      mockFavouriteRepository.findOne.mockResolvedValue(existingFav);
      mockFavouriteRepository.remove.mockResolvedValue(existingFav);

      const result = await service.toggleFavourite(1, 10);

      expect(favouriteRepository.findOne).toHaveBeenCalledWith({ where: { userId: 1, roomId: 10 } });
      expect(favouriteRepository.remove).toHaveBeenCalledWith(existingFav);
      expect(result).toEqual({
        message: 'Đã bỏ lưu phòng trọ khỏi danh sách yêu thích.',
        isFavorite: false,
      });
    });

    it('nên tạo mới yêu thích nếu chưa tồn tại bản ghi (Lưu)', async () => {
      mockFavouriteRepository.findOne.mockResolvedValue(null);
      const newFav = { userId: 1, roomId: 10 } as Favourite;
      mockFavouriteRepository.create.mockReturnValue(newFav);
      mockFavouriteRepository.save.mockResolvedValue(newFav);

      const result = await service.toggleFavourite(1, 10);

      expect(favouriteRepository.findOne).toHaveBeenCalledWith({ where: { userId: 1, roomId: 10 } });
      expect(favouriteRepository.create).toHaveBeenCalledWith({ userId: 1, roomId: 10 });
      expect(favouriteRepository.save).toHaveBeenCalledWith(newFav);
      expect(result).toEqual({
        message: 'Đã lưu phòng trọ vào danh sách yêu thích.',
        isFavorite: true,
      });
    });
  });

  describe('getMyFavourites', () => {
    it('nên trả về danh sách chi tiết các phòng trọ đã thích', async () => {
      const mockList = [
        { userId: 1, roomId: 10, room: { id: 10, title: 'Phòng trọ giá rẻ' } },
        { userId: 1, roomId: 11, room: { id: 11, title: 'Phòng trọ cao cấp' } },
      ];
      mockFavouriteRepository.find.mockResolvedValue(mockList);

      const result = await service.getMyFavourites(1);

      expect(favouriteRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        relations: ['room'],
      });
      expect(result).toEqual([
        { id: 10, title: 'Phòng trọ giá rẻ' },
        { id: 11, title: 'Phòng trọ cao cấp' },
      ]);
    });
  });
});