import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { UserOutlined, KeyOutlined, PhoneOutlined, SolutionOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import './Login.css'; // Sử dụng chung file style với trang Login để đồng bộ giao diện
import { userApi } from '../api/userApi';

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'Tenant', // Giá trị mặc định theo đúng enum yêu cầu
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Kiểm tra khớp mật khẩu trước khi gọi API
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);

    try {
      // Chỉ gửi các trường hợp chuẩn theo RegisterDto lên backend (bỏ confirmPassword)
      const payload = {
        username: formData.username,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
      };

      const res = await userApi.register(payload);
      setSuccess(res.data?.message || 'Đăng ký tài khoản thành công!');
      
      setTimeout(() => {
        if (onSwitchToLogin) onSwitchToLogin();
      }, 1500);

    } catch (err) {
      const resData = err.response?.data;
      if (resData) {
        if (Array.isArray(resData.message)) {
          setError(resData.message.join(', '));
        } else {
          setError(resData.message || 'Đăng ký thất bại!');
        }
      } else {
        setError('Không thể kết nối đến máy chủ Backend!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-login-container">
      <div className="login-overlay"></div>

      <div className="login-wrapper" style={{ maxWidth: '480px' }}>
        <div className="login-logo text-center mb-3">
          <h1 className="logo-text">
            ROOM <span className="logo-circle"></span>
          </h1>
          <div className="logo-sub">MANAGEMENT SYSTEM</div>
        </div>

        <div className="login-card">
          <h2 className="login-title">ĐĂNG KÝ TÀI KHOẢN</h2>

          {error && <Alert variant="danger" className="py-2 text-center fs-7 mt-2 mb-2">{error}</Alert>}
          {success && <Alert variant="success" className="py-2 text-center fs-7 mt-2 mb-2">{success}</Alert>}

          <Form onSubmit={handleSubmit} className="mt-2">
            {/* Tên đăng nhập */}
            <Form.Group className="mb-3 position-relative">
              <div className="input-icon-wrapper">
                <UserOutlined className="input-icon" />
                <Form.Control
                  type="text"
                  name="username"
                  placeholder="Tên đăng nhập (3 - 50 ký tự)"
                  value={formData.username}
                  onChange={handleChange}
                  className="login-input"
                  minLength={3}
                  maxLength={50}
                  disabled={loading}
                  required
                />
              </div>
            </Form.Group>

            {/* Mật khẩu */}
            <Form.Group className="mb-3 position-relative">
              <div className="input-icon-wrapper">
                <KeyOutlined className="input-icon" />
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Mật khẩu (6 - 20 ký tự)"
                  value={formData.password}
                  onChange={handleChange}
                  className="login-input"
                  minLength={6}
                  maxLength={20}
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

            {/* Nhập lại mật khẩu */}
            <Form.Group className="mb-3 position-relative">
              <div className="input-icon-wrapper">
                <KeyOutlined className="input-icon" />
                <Form.Control
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Xác nhận lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="login-input"
                  disabled={loading}
                  required
                />
                <span 
                  className="password-toggle-icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </span>
              </div>
            </Form.Group>

            {/* Số điện thoại */}
            <Form.Group className="mb-3 position-relative">
              <div className="input-icon-wrapper">
                <PhoneOutlined className="input-icon" />
                <Form.Control
                  type="text"
                  name="phone"
                  placeholder="Nhập số điện thoại liên hệ"
                  value={formData.phone}
                  onChange={handleChange}
                  className="login-input"
                  disabled={loading}
                  required
                />
              </div>
            </Form.Group>

            {/* Vai trò */}
            <Form.Group className="mb-4 position-relative">
              <div className="input-icon-wrapper">
                <SolutionOutlined className="input-icon" />
                <Form.Select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange}
                  className="login-input"
                  style={{ paddingLeft: '42px' }}
                  disabled={loading}
                >
                  <option value="Tenant">Người thuê trọ (Tenant)</option>
                  <option value="Landlord">Chủ cho thuê (Landlord)</option>
                </Form.Select>
              </div>
            </Form.Group>

            <Button type="submit" className="w-100 btn-custom-login mb-3" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Đang xử lý...
                </>
              ) : (
                'ĐĂNG KÝ NGAY'
              )}
            </Button>

            <div className="text-center fs-7">
              Đã có tài khoản?{' '}
              <span 
                className="text-primary fw-bold text-decoration-underline" 
                style={{ cursor: 'pointer' }}
                onClick={onSwitchToLogin}
              >
                Đăng nhập ngay
              </span>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Register;