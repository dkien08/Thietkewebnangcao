import axiosClient from './axiosClient';

export const userApi = {
  // --- NHÓM AUTHENTICATION ---
  // F01: Đăng ký
  register: (data) => axiosClient.post('/auth/register', data),

  // F02: Đăng nhập
  login: (data) => axiosClient.post('/auth/login', data),

  // F02.1: Đăng xuất
  logout: () => axiosClient.post('/auth/logout'),

  // F03.3: Đổi mật khẩu
  changePassword: (data) => axiosClient.post('/auth/change-password', data),


  // --- NHÓM USER PROFILE (Chuẩn prefix /users) ---
  // F03: Lấy thông tin cá nhân
  getProfile: () => axiosClient.get('/users/profile'),

  // F03.1: Cập nhật thông tin cá nhân
  updateProfile: (data) => axiosClient.put('/users/profile', data),

  // F03.2: Chuyển đổi vai trò (Tenant <-> Landlord)
  switchMode: () => axiosClient.put('/users/switch-mode'),


  // --- NHÓM QUẢN TRỊ ADMIN (F21 -> F24 cho TV1) ---
  // F21: Lấy danh sách toàn bộ người dùng
  getAllUsers: (params) => axiosClient.get('/users', { params }),

  // F22: Truy vấn chi tiết người dùng
  getUserDetail: (id) => axiosClient.get(`/users/${id}`),

  // F23: Cập nhật quyền/trạng thái tài khoản (Khóa / Mở khóa)
  updateUserStatus: (id, data) => axiosClient.put(`/users/${id}`, data),

  // F24: Xóa tài khoản
  deleteUser: (id) => axiosClient.delete(`/users/${id}`),
};