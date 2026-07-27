import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PhenikaaLogin from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import UserProfile from './pages/UserProfile';
import Contracts from './pages/Contracts';
import Favorites from './pages/Favorites';
import MyRooms from './pages/MyRooms';
import LandlordDashboard from './pages/LandlordDashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { userApi } from './api/userApi';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const localUser = localStorage.getItem('user');

      if (token && localUser) {
        setIsAuthenticated(true);
      }

      try {
        if (userApi && typeof userApi.getProfile === 'function' && token) {
          const res = await userApi.getProfile();
          if (res.data) {
            setIsAuthenticated(true);
            const userData = res.data?.user || res.data?.data || res.data;
            localStorage.setItem('user', JSON.stringify(userData));
          }
        }
      } catch (error) {
        console.warn('Token hết hạn hoặc chưa đăng nhập.');
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      if (userApi && typeof userApi.logout === 'function') {
        await userApi.logout();
      }
    } catch (e) {
      console.log('Lỗi đăng xuất:', e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('saved_user_profile');
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

  return (
    <Routes>
      {!isAuthenticated ? (
        <>
          <Route 
            path="*" 
            element={
              currentView === 'login' ? (
                <PhenikaaLogin 
                  onLoginSuccess={handleLoginSuccess} 
                  onSwitchToRegister={() => setCurrentView('register')} 
                />
              ) : (
                <Register 
                  onSwitchToLogin={() => setCurrentView('login')} 
                />
              )
            } 
          />
        </>
      ) : (
        <>
          {/* Khi đã đăng nhập, cho phép truy cập các Route chính */}
          <Route path="/" element={<Home onLogout={handleLogout} />} />
          <Route path="/profile" element={<UserProfile onLogout={handleLogout} />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/my-rooms" element={<MyRooms />} />
          <Route path="/landlord" element={<LandlordDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}