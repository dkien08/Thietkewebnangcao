import axios from 'axios';

// Domain Backend GitHub Codespace Port 3000 của bạn
const CODESPACE_BACKEND_URL = 'https://bug-free-broccoli-jjqp6g4x9jjrcqrqw-3000.app.github.dev';

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || `${CODESPACE_BACKEND_URL}/api`,
  withCredentials: true, // BẮT BUỘC: Đề gửi kèm Cookie chứa JWT sang Backend NestJS
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động đính kèm Token dự phòng nếu có lưu ở localStorage
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý Lỗi tập trung
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Có thể xử lý tự động điều hướng sang trang /login tại đây
    }
    return Promise.reject(error);
  }
);

export default axiosClient;