import React, { useState } from 'react';
import { Form, Button, Alert, Spinner, Card } from 'react-bootstrap';
import { UserOutlined, KeyOutlined, PhoneOutlined, SolutionOutlined } from '@ant-design/icons';
import { userApi } from '../api/userApi';

const Register = ({ onSwitchToLogin }) => {
  // ✅ Chuẩn hóa theo đúng RegisterDto: username, password, phone, role ('Tenant' | 'Landlord')
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phone: '',
    role: 'Tenant', // Đúng chữ hoa T như IsEnum(['Tenant', 'Landlord'])
  });

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
    setLoading(true);

    try {
      const res = await userApi.register(formData);
      setSuccess(res.data?.message || 'Đăng ký thành công!');
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
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card style={{ width: '400px' }} className="p-4 shadow-sm border-0 rounded-3">
        <h3 className="text-center font-weight-bold mb-4">ĐĂNG KÝ TÀI KHOẢN</h3>

        {error && <Alert variant="danger" className="py-2 small text-center">{error}</Alert>}
        {success && <Alert variant="success" className="py-2 small text-center">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          {/* Tên đăng nhập (username) */}
          <Form.Group className="mb-3">
            <Form.Label className="small fw-semibold">Tên đăng nhập</Form.Label>
            <div className="input-group">
              <span className="input-group-text"><UserOutlined /></span>
              <Form.Control
                type="text"
                name="username"
                placeholder="Từ 3 - 50 ký tự"
                value={formData.username}
                onChange={handleChange}
                minLength={3}
                maxLength={50}
                required
              />
            </div>
          </Form.Group>

          {/* Mật khẩu (password) */}
          <Form.Group className="mb-3">
            <Form.Label className="small fw-semibold">Mật khẩu</Form.Label>
            <div className="input-group">
              <span className="input-group-text"><KeyOutlined /></span>
              <Form.Control
                type="password"
                name="password"
                placeholder="Từ 6 - 20 ký tự"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                maxLength={20}
                required
              />
            </div>
          </Form.Group>

          {/* Số điện thoại (phone) */}
          <Form.Group className="mb-3">
            <Form.Label className="small fw-semibold">Số điện thoại</Form.Label>
            <div className="input-group">
              <span className="input-group-text"><PhoneOutlined /></span>
              <Form.Control
                type="text"
                name="phone"
                placeholder="Nhập số điện thoại"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </Form.Group>

          {/* Vai trò (role) */}
          <Form.Group className="mb-4">
            <Form.Label className="small fw-semibold">Bạn là?</Form.Label>
            <div className="input-group">
              <span className="input-group-text"><SolutionOutlined /></span>
              <Form.Select name="role" value={formData.role} onChange={handleChange}>
                <option value="Tenant">Người thuê trọ (Tenant)</option>
                <option value="Landlord">Chủ cho thuê (Landlord)</option>
              </Form.Select>
            </div>
          </Form.Group>

          <Button type="submit" className="w-100 btn-primary mb-3" disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : 'ĐĂNG KÝ'}
          </Button>

          <div className="text-center small">
            Đã có tài khoản?{' '}
            <span 
              className="text-primary cursor-pointer text-decoration-underline" 
              style={{ cursor: 'pointer' }}
              onClick={onSwitchToLogin}
            >
              Đăng nhập ngay
            </span>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;