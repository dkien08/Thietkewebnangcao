// client/src/api/axiosClient.js
import axios from 'axios';

const getBaseUrl = () => {
  // 1. Ưu tiên lấy từ biến môi trường nếu có
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 2. Tự động suy luận trên GitHub Codespaces
  if (window.location.hostname.includes('app.github.dev')) {
    const hostname = window.location.hostname;
    const parts = hostname.split('-');
    
    // 🟢 Chuyển từ port hiện tại của Frontend (3001) sang port 3000 của Backend
    parts[parts.length - 1] = '3000.app.github.dev';
    const backendHost = parts.join('-');
    
    return `https://${backendHost}/api`;
  }

  // 3. Mặc định chạy ở Localhost (Backend chạy port 3000)
  return 'http://localhost:3000/api';
};

const axiosClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor tự động đính kèm Token vào mỗi Request
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

// Trả về nguyên bản response để các trang đọc .data chuẩn xác
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default axiosClient;