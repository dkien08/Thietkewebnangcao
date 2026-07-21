import React, { useState, useEffect } from 'react';
import PhenikaaLogin from './pages/PhenikaaLogin';
import PhenikaaLayout from './pages/PhenikaaLayout';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  // State lưu trữ trạng thái đăng nhập
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Kiểm tra xem đã có thông tin đăng nhập trong localStorage chưa
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  // Hàm xử lý sau khi đăng nhập thành công từ PhenikaaLogin
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Hàm xử lý đăng xuất (truyền xuống Dashboard nếu cần)
  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  return (
    <div>
      {isAuthenticated ? (
        <PhenikaaLayout onLogout={handleLogout} />
      ) : (
        <PhenikaaLogin onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;