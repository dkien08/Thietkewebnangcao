import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/userApi';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // ✅ Gửi đúng username và password khớp với LoginDto
      const response = await userApi.login({
        username: values.username,
        password: values.password,
      });

      if (response.data && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      message.success('🔑 Đăng nhập hệ thống thành công!');
      
      setTimeout(() => {
        navigate('/');
      }, 500);

    } catch (error) {
      const errorMsg = error.response?.data?.message;
      const displayMsg = Array.isArray(errorMsg) ? errorMsg.join(', ') : (errorMsg || 'Sai tài khoản hoặc mật khẩu!');
      message.error('❌ Đăng nhập thất bại: ' + displayMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card title="🔑 ĐĂNG NHẬP HỆ THỐNG" style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item 
            label="Tên tài khoản" 
            name="username" 
            rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username..." />
          </Form.Item>

          <Form.Item 
            label="Mật khẩu" 
            name="password" 
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block style={{ height: '40px', fontWeight: 'bold' }}>
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}