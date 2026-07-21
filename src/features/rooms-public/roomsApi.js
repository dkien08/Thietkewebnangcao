import axiosClient from '../../config/axiosClient';

export const roomsApi = {
  // F04: Lấy danh sách tất cả phòng trọ đang trống
  getAllAvailable: () => axiosClient.get('/rooms'),

  // F05: Xem chi tiết một phòng trọ cụ thể
  getDetail: (id) => axiosClient.get(`/rooms/${id}`),

  // F06: Bộ lọc tìm kiếm nâng cao
  searchRooms: (params) => axiosClient.get('/rooms/search', { params }),

  // F19: Thêm ảnh phòng trọ mới
  uploadImage: (roomId, imageData) => 
    axiosClient.post(`/rooms/${roomId}/images`, imageData),

  // F20: Xóa lẻ ảnh phòng trọ
  deleteImage: (roomId, imageId) => 
    axiosClient.delete(`/rooms/${roomId}/images/${imageId}`),
};