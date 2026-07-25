import axiosClient from './axiosClient';

export const roomApi = {
  // --- DÀNH CHO TENANT / KHÁCH THUÊ ---
  // F04: Lấy danh sách tất cả phòng trống
  getAllAvailable: () => axiosClient.get('/rooms'),

  // F05: Lấy thông tin chi tiết 1 phòng
  getDetail: (id) => axiosClient.get(`/rooms/${id}`),

  // F06: Lọc / Tìm kiếm phòng nâng cao
  searchRooms: (params) => axiosClient.get('/rooms/search', { params }),

  // 🟢 BỔ SUNG: Lấy thông tin phòng đang thuê của chính Tenant (Trả về null nếu chưa thuê)
  getMyActiveRoom: () => axiosClient.get('/rooms/my-active-room'),

  // 🟢 BỔ SUNG: Gửi yêu cầu thuê phòng
  requestRentRoom: (roomId, data) => axiosClient.post(`/rooms/${roomId}/rent-request`, data),


  // --- DÀNH CHO LANDLORD (CHỦ NHÀ / ADMIN) ---
  // F10: Tạo bài đăng phòng trọ mới
  createRoom: (data) => axiosClient.post('/rooms', data),

  // F11: Lấy danh sách phòng thuộc sở hữu của Chủ nhà đang đăng nhập
  getLandlordRooms: () => axiosClient.get('/rooms/landlord'),

  // F12: Cập nhật thông tin phòng / Chuyển trạng thái Bảo trì
  updateRoom: (id, data) => axiosClient.put(`/rooms/${id}`, data),

  // F13: Xóa bài đăng phòng trọ
  deleteRoom: (id) => axiosClient.delete(`/rooms/${id}`),

  // F19: Thêm ảnh phòng trọ
  uploadRoomImage: (roomId, imageData) =>
    axiosClient.post(`/rooms/${roomId}/images`, imageData),

  // F20: Xóa lẻ 1 ảnh phòng trọ
  deleteRoomImage: (roomId, imageId) => axiosClient.delete(`/rooms/${roomId}/images/${imageId}`),
};