import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { UserOutlined, KeyOutlined, EyeOutlined, EyeInvisibleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import './PhenikaaLogin.css';
import { userApi } from '../api/userApi';

const PhenikaaLogin = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await userApi.login({ username, password });

      setSuccessMessage(response.data?.message || 'Đăng nhập thành công!');

      // 🌟 LỰA CHỌN DỮ LIỆU THÔNG MINH:
      // Lấy profile đã được lưu nếu người dùng từng chỉnh sửa
      const savedProfile = localStorage.getItem('saved_user_profile');
      
      if (savedProfile) {
        localStorage.setItem('user', savedProfile);
      } else if (response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        localStorage.setItem('user', JSON.stringify({ username }));
      }

      localStorage.setItem('token', response.data?.token || 'mock-jwt-token');

      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }, 800);

    } catch (error) {
      if (error.response && error.response.data) {
        const resData = error.response.data;
        if (Array.isArray(resData.message)) {
          setErrorMessage(resData.message.join(', '));
        } else {
          setErrorMessage(resData.message || 'Tài khoản hoặc mật khẩu không chính xác!');
        }
      } else {
        // Fallback giả lập khi chạy local dev
        const savedProfile = localStorage.getItem('saved_user_profile');
        if (savedProfile) {
          localStorage.setItem('user', savedProfile);
        } else {
          localStorage.setItem('user', JSON.stringify({ username }));
        }
        localStorage.setItem('token', 'mock-jwt-token');
        setSuccessMessage('Đăng nhập thành công!');

        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess();
          }
        }, 800);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="phenikaa-login-container">
      <div className="login-overlay"></div>

      <div className="login-wrapper">
        <div className="login-logo text-center mb-4">
          <h1 className="logo-text">
            PHENIKAA <span className="logo-circle"></span>
          </h1>
          <div className="logo-sub">UNIVERSITY</div>
        </div>

        <div className="login-card">
          <div className="paper-plane-icon">
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#4a6cf7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13"></path>
              <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
            </svg>
          </div>

          <h2 className="login-title">ĐĂNG NHẬP</h2>

          {errorMessage && <Alert variant="danger" className="py-2 text-center fs-7 mt-3 mb-0">{errorMessage}</Alert>}
          {successMessage && <Alert variant="success" className="py-2 text-center fs-7 mt-3 mb-0">{successMessage}</Alert>}

          <Form onSubmit={handleSubmit} className="mt-3">
            <Form.Group className="mb-3 position-relative">
              <div className="input-icon-wrapper">
                <UserOutlined className="input-icon" />
                <Form.Control
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="login-input"
                  disabled={loading}
                  required
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3 position-relative">
              <div className="input-icon-wrapper">
                <KeyOutlined className="input-icon" />
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input"
                  disabled={loading}
                  required
                />
                <span 
                  className="password-toggle-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </span>
              </div>
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center mb-4 login-links">
              <a href="#forgot" className="forgot-link">Quên mật khẩu</a>
              <a href="#help" className="help-link">
                <QuestionCircleOutlined className="me-1" /> Trợ giúp!
              </a>
            </div>

            <Button type="submit" className="w-100 btn-phenikaa-login mb-3" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Đang xử lý...
                </>
              ) : (
                'ĐĂNG NHẬP'
              )}
            </Button>

            <div className="text-center mb-3 fs-7">
              Chưa có tài khoản?{' '}
              <span 
                className="text-primary fw-bold text-decoration-underline" 
                style={{ cursor: 'pointer' }}
                onClick={onSwitchToRegister}
              >
                Đăng ký ngay
              </span>
            </div>

            <div className="divider mb-4">
              <span>Hoặc đăng nhập</span>
            </div>

            <Button variant="light" className="w-100 btn-microsoft" disabled={loading}>
              <svg className="ms-logo me-2" width="18" height="18" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
              </svg>
              Sign in using Microsoft
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default PhenikaaLogin;