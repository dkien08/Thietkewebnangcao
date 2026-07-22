import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Tag, message, Modal, Divider, Spin } from 'antd';
import { UserOutlined, PhoneOutlined, LockOutlined, SwapOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/userApi';

export default function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const navigate = useNavigate();

  // F03: Lấy thông tin người dùng
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await userApi.getProfile();
      const userData = res.data;
      setProfile(userData);
      profileForm.setFieldsValue({
        username: userData.username,
        phone: userData.phone,
        fullName: userData.fullName || '',
      });
    } catch (error) {
      message.error('Không thể lấy thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // F02.1: Xử lý Đăng xuất
  const handleLogout = async () => {
    try {
      await userApi.logout();
      localStorage.removeItem('user');
      message.success('Đã đăng xuất thành công!');
      navigate('/login');
    } catch (error) {
      message.error('Lỗi khi đăng xuất!');
    }
  };

  // F03.1: Cập nhật profile
  const handleUpdateProfile = async (values) => {
    try {
      setSubmitting(true);
      await userApi.updateProfile(values);
      message.success('Cập nhật thông tin thành công!');
      fetchProfile();
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Cập nhật thất bại';
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // F03.2: Chuyển đổi vai trò
  const handleSwitchRole = async () => {
    try {
      setLoading(true);
      const res = await userApi.switchMode();
      message.success(res.data.message || 'Chuyển đổi vai trò thành công!');
      fetchProfile();
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Không thể chuyển đổi vai trò!';
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // F03.3: Đổi mật khẩu
  const handleChangePassword = async (values) => {
    try {
      setSubmitting(true);
      await userApi.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success('Đổi mật khẩu thành công!');
      setIsPasswordModalOpen(false);
      passwordForm.resetFields();
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Đổi mật khẩu thất bại';
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ maxWidth: 600, margin: '30px auto', padding: '0 15px' }}>
      <Card 
        title="👤 HỒ SƠ NGUỜI DÙNG" 
        extra={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Tag color={profile?.role === 'Landlord' ? 'gold' : 'blue'}>{profile?.role}</Tag>
            {/* 🚪 NÚT ĐĂNG XUẤT F02.1 */}
            <Button danger icon={<LogoutOutlined />} size="small" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </div>
        }
      >
        {/* Chuyển vai trò */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, background: '#f5f5f5', padding: 12, borderRadius: 6 }}>
          <span>Vai trò hiện tại: <strong>{profile?.role === 'Landlord' ? 'Chủ cho thuê (Landlord)' : 'Người thuê trọ (Tenant)'}</strong></span>
          <Button icon={<SwapOutlined />} onClick={handleSwitchRole}>
            Đổi vai trò
          </Button>
        </div>

        {/* Form Cập nhật thông tin */}
        <Form form={profileForm} layout="vertical" onFinish={handleUpdateProfile}>
          <Form.Item label="Tên đăng nhập" name="username">
            <Input prefix={<UserOutlined />} disabled />
          </Form.Item>

          <Form.Item label="Họ và tên" name="fullName">
            <Input placeholder="Nhập họ và tên..." />
          </Form.Item>

          <Form.Item 
            label="Số điện thoại" 
            name="phone" 
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại..." />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={submitting} block style={{ marginBottom: 12 }}>
            Lưu thay đổi
          </Button>
        </Form>

        <Divider />

        {/* Đổi mật khẩu */}
        <Button danger type="dashed" block icon={<LockOutlined />} onClick={() => setIsPasswordModalOpen(true)}>
          Đổi mật khẩu
        </Button>
      </Card>

      {/* Modal Đổi mật khẩu */}
      <Modal
        title="🔑 Đổi mật khẩu"
        open={isPasswordModalOpen}
        onCancel={() => setIsPasswordModalOpen(false)}
        footer={null}
      >
        <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
          <Form.Item label="Mật khẩu cũ" name="oldPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}>
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }, { min: 6, message: 'Ít nhất 6 ký tự!' }]}>
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item 
            label="Xác nhận mật khẩu mới" 
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={submitting} block style={{ height: 40 }}>
            Cập nhật mật khẩu
          </Button>
        </Form>
      </Modal>
    </div>
  );
}