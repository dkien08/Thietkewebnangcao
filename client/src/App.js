import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import PhenikaaLogin from './pages/PhenikaaLogin';
import Register from './pages/Register';
import Home from './pages/Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { userApi } from './api/userApi';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      const savedProfile = localStorage.getItem('saved_user_profile');
      const localUser = localStorage.getItem('user');

      // Ưu tiên sử dụng Profile người dùng đã chỉnh sửa
      if (savedProfile) {
        localStorage.setItem('user', savedProfile);
        setIsAuthenticated(true);
      } else if (localUser && token) {
        setIsAuthenticated(true);
      }

      try {
        if (userApi && typeof userApi.getProfile === 'function') {
          const res = await userApi.getProfile();
          if (res.data) {
            setIsAuthenticated(true);
            // Nếu chưa từng sửa profile thì mới dùng dữ liệu từ API
            if (!localStorage.getItem('saved_user_profile')) {
              const userData = res.data?.user || res.data?.data || res.data;
              localStorage.setItem('user', JSON.stringify(userData));
            }
          }
        }
      } catch (error) {
        console.warn('Chưa đăng nhập hoặc token hết hạn.');
        if (!token && !savedProfile && !localUser) {
          setIsAuthenticated(false);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Hàm Đăng xuất: Xóa Token nhưng GIỮ LẠI thông tin Profile đã cập nhật
  const handleLogout = async () => {
    try {
      if (userApi && typeof userApi.logout === 'function') {
        await userApi.logout();
      }
    } catch (e) {
      console.log('Lỗi đăng xuất:', e);
    } finally {
      // Chỉ xóa token xác thực, KHÔNG xóa saved_user_profile
      localStorage.removeItem('token');
      localStorage.removeItem('user'); 
      setIsAuthenticated(false);
      setCurrentView('login');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#666' }}>
        Đang tải dữ liệu...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Home onLogout={handleLogout} />;
  }

  return (
    <div>
      {currentView === 'login' ? (
        <PhenikaaLogin 
          onLoginSuccess={handleLoginSuccess} 
          onSwitchToRegister={() => setCurrentView('register')} 
        />
      ) : (
        <Register 
          onSwitchToLogin={() => setCurrentView('login')} 
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}