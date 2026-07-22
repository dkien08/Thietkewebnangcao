import axios from 'axios';

// Lấy baseURL từ biến môi trường hoặc dùng mặc định localhost của Backend
const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động đính kèm Token khi gửi request (nếu người dùng đã đăng nhập)
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý dữ liệu trả về và lỗi tập trung
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Xử lý khi Token hết hạn (nếu cần)
    }
    return Promise.reject(error);
  }
);

export default axiosClient;