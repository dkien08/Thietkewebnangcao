import axios from 'axios';

// Thay đúng link Port 3000 từ tab PORTS
const API_BASE_URL = 'https://bug-free-broccoli-jjqp6g4x9jjrcqrqw-3000.app.github.dev';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`, // Prefix /api/auth
  withCredentials: true,               // Bắt buộc phải có để gửi/nhận Cookie access_token
  headers: {
    'Content-Type': 'application/json',
  },
});


export const userApi = {
  // F01: Đăng ký (nhận { username, password, phone, role })
  register: (data) => api.post('/register', data),

  // F02: Đăng nhập (nhận { username, password })
  login: (data) => api.post('/login', data),

  // F02.1: Đăng xuất (xóa Cookie)
  logout: () => api.post('/logout'),

  // F03: Lấy thông tin cá nhân
  getProfile: () => api.get('/profile'),

  // F03.1: Cập nhật thông tin cá nhân
  updateProfile: (data) => api.put('/profile', data),

  // F03.2: Chuyển đổi vai trò (Tenant <-> Landlord)
  switchMode: () => api.put('/switch-mode'),

  // F03.3: Đổi mật khẩu
  changePassword: (data) => api.post('/change-password', data),
};