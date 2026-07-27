// // src/api/roomApi.js
import axiosClient from './axiosClient';

export const roomApi = {
  // [F04] Lấy danh sách tất cả phòng trọ đang trống (status = Available) cho Tenant/Khách
  getAllRooms: () => axiosClient.get('/rooms'),
  getRooms: () => axiosClient.get('/rooms'), // Alias gọi phòng cho Tenant

  // [F05] Xem chi tiết một phòng trọ (Hỗ trợ cả 2 tên gọi để tránh lệch code)
  getRoomById: (id) => axiosClient.get(`/rooms/${id}`),
  getDetail: (id) => axiosClient.get(`/rooms/${id}`),

  // [F06] Tìm kiếm & Lọc phòng trọ nâng cao (giá, quận/huyện, tiện ích)
  searchRooms: (params) => axiosClient.get('/rooms/search', { params }),

  // [F10] Chủ nhà (Landlord) tạo phòng trọ mới
  createRoom: (data) => axiosClient.post('/rooms', data),

  // [F11] Lấy danh sách các phòng trọ thuộc quyền sở hữu của Chủ nhà đang đăng nhập
  getLandlordRooms: () => axiosClient.get('/rooms/landlord'),

  // [F12] Chủ nhà cập nhật thông tin / trạng thái phòng trọ
  updateRoom: (id, data) => axiosClient.put(`/rooms/${id}`, data),

  // [F13] Chủ nhà xóa bài đăng phòng trọ
  deleteRoom: (id) => axiosClient.delete(`/rooms/${id}`),

  // [F19] Thêm ảnh phòng trọ (Upload FormData trực tiếp)
  addRoomImages: (roomId, formData) => {
    return axiosClient.post(`/rooms/${roomId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // [F20] Xóa lẻ một ảnh của phòng trọ
  deleteRoomImage: (roomId, imageId) => {
    return axiosClient.delete(`/rooms/${roomId}/images/${imageId}`);
  },

  // ==========================================================
  // 🟢 BỔ SUNG CÁC HÀM API CHO FAVORITE (KHỚP VỚI BACKEND /api/favorites)
  // ==========================================================
  
  // [F07] Thêm hoặc bỏ yêu thích (Toggle Favorite)
  // Backend dùng POST /api/favorites với body { roomId }
  addFavorite: (roomId) => axiosClient.post('/favorites', { roomId: Number(roomId) }),
  removeFavorite: (roomId) => axiosClient.post('/favorites', { roomId: Number(roomId) }),

  // [F18] Lấy danh sách phòng trọ đã yêu thích của Tenant hiện tại
  getFavorites: () => axiosClient.get('/favorites'),
  
};

// Export default để import kiểu nào cũng không lo văng lỗi
export default roomApi;