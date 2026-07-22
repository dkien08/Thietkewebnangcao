import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Tab, Tabs } from 'react-bootstrap';
import { userApi } from '../api/userApi';

const ProfileModal = ({ show, onHide, onProfileUpdated }) => {
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState('');
  
  // Đổi mật khẩu
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      fetchProfile();
    }
  }, [show]);

  const fetchProfile = async () => {
    try {
      const res = await userApi.getProfile();
      setUser(res.data);
      setPhone(res.data.phone || '');
    } catch (err) {
      setMessage({ type: 'danger', text: 'Không thể tải thông tin cá nhân' });
    }
  };

  const handleUpdatePhone = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      const res = await userApi.updateProfile({ phone });
      setUser(res.data);
      setMessage({ type: 'success', text: 'Cập nhật số điện thoại thành công!' });
      if (onProfileUpdated) onProfileUpdated(res.data);
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Cập nhật thất bại' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      const res = await userApi.changePassword(passwords);
      setMessage({ type: 'success', text: res.data.message });
      setPasswords({ oldPassword: '', newPassword: '' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Đổi mật khẩu thất bại' });
    }
  };

  const handleSwitchMode = async () => {
    setLoading(true);
    try {
      const res = await userApi.switchMode();
      setMessage({ type: 'success', text: res.data.message });
      fetchProfile();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Không thể chuyển vai trò' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fs-5 fw-bold">Thông tin tài khoản & Cài đặt</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message.text && <Alert variant={message.type} className="py-2 small">{message.text}</Alert>}

        {user && (
          <Tabs defaultActiveKey="info" className="mb-3">
            {/* TAB 1: Cập nhật thông tin */}
            <Tab eventKey="info" title="Thông tin">
              <Form onSubmit={handleUpdatePhone}>
                <Form.Group className="mb-2">
                  <Form.Label className="small text-muted">Tên đăng nhập</Form.Label>
                  <Form.Control type="text" value={user.username} disabled />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label className="small text-muted">Vai trò hiện tại</Form.Label>
                  <Form.Control type="text" value={user.role} disabled />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold">Số điện thoại</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="Nhập 10 - 15 số" 
                  />
                </Form.Group>
                <Button type="submit" variant="primary" size="sm" className="w-100">
                  Lưu thay đổi SĐT
                </Button>
              </Form>

              <hr />

              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold small">Chuyển vai trò (Tenant $\leftrightarrow$ Landlord)</div>
                  <div className="text-muted extra-small">Thay đổi linh hoạt chế độ sử dụng</div>
                </div>
                <Button variant="outline-warning" size="sm" onClick={handleSwitchMode} disabled={loading}>
                  Chuyển vai trò
                </Button>
              </div>
            </Tab>

            {/* TAB 2: Đổi mật khẩu */}
            <Tab eventKey="password" title="Đổi mật khẩu">
              <Form onSubmit={handleChangePassword}>
                <Form.Group className="mb-2">
                  <Form.Label className="small fw-semibold">Mật khẩu cũ</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={passwords.oldPassword} 
                    onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                    required 
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold">Mật khẩu mới</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={passwords.newPassword} 
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    placeholder="Từ 6 đến 20 ký tự"
                    required 
                  />
                </Form.Group>
                <Button type="submit" variant="danger" size="sm" className="w-100">
                  Cập nhật mật khẩu
                </Button>
              </Form>
            </Tab>
          </Tabs>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ProfileModal;