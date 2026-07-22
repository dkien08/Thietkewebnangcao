import axiosClient from './axiosClient';

export const roomApi = {
  // 1. [F04] Lấy danh sách tất cả các phòng đang có sẵn (Trang chủ)
  getAllAvailable: () => {
    return axiosClient.get('/rooms');
  },

  // 2. [F06] Lọc / Tìm kiếm phòng nâng cao theo tham số (Quận, giá, tiện nghi...)
  searchRooms: (params) => {
    return axiosClient.get('/rooms/search', { params });
  },

  // 3. [F05] Lấy thông tin chi tiết của 1 phòng trọ theo ID (Bao gồm ảnh & SĐT chủ nhà)
  getDetail: (id) => {
    return axiosClient.get(`/rooms/${id}`);
  },

  // 4. Lấy danh sách phòng/yêu cầu thuê phòng của người dùng hiện tại (Trang Quản lý phòng)
  getMyRooms: () => {
    return axiosClient.get('/rooms/my-rooms');
  },

  // 5. Tạo mới bài đăng phòng trọ (Dành cho chủ trọ)
  createRoom: (data) => {
    return axiosClient.post('/rooms', data);
  },

  // 6. Cập nhật thông tin phòng trọ
  updateRoom: (id, data) => {
    return axiosClient.put(`/rooms/${id}`, data);
  },

  // 7. Xóa phòng / Hủy yêu cầu thuê phòng
  deleteRoom: (id) => {
    return axiosClient.delete(`/rooms/${id}`);
  }
};