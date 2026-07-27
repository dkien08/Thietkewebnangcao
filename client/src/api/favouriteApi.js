// client/src/api/favouriteApi.js
import axiosClient from './axiosClient';

export const favouriteApi = {
  // Lấy danh sách các phòng trọ đã yêu thích
  getFavourites: () => {
    return axiosClient.get('/favourites');
  },

  // Thêm phòng vào danh sách yêu thích
  addFavourite: (roomId) => {
    return axiosClient.post(`/favourites/${roomId}`);
  },

  // Xóa phòng khỏi danh sách yêu thích
  removeFavourite: (roomId) => {
    return axiosClient.delete(`/favourites/${roomId}`);
  },
};