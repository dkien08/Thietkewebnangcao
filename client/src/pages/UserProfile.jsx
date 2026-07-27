import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/userApi';

const UserProfile = ({ show, onHide, onUpdateSuccess, onLogout }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    role: '',
    currentMode: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (show || show === undefined) {
      fetchUserProfile();
    } else {
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [show]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await userApi.getProfile();
      const user = response.data || response;
      setFormData({
        username: user.username || '',
        phone: user.phone || '',
        role: user.role || '',
        currentMode: user.currentMode || user.currentRole || ''
      });
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      setErrorMessage('Không thể tải thông tin cá nhân từ Server.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (formData.phone && (formData.phone.length < 10 || formData.phone.length > 15)) {
      setErrorMessage('Số điện thoại hợp lệ phải từ 10 đến 15 số!');
      return;
    }

    setSubmitting(true);
    try {
      const response = await userApi.updateProfile({ phone: formData.phone });
      const updatedUser = response.data || response;
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const mergedUser = {
        ...currentUser,
        ...updatedUser,
        phone: updatedUser.phone || formData.phone,
        username: updatedUser.username || currentUser.username || formData.username
      };
      localStorage.setItem('user', JSON.stringify(mergedUser));
      setFormData((prev) => ({ ...prev, phone: mergedUser.phone || prev.phone }));
      setSuccessMessage('Cập nhật thông tin thành công!');
      if (onUpdateSuccess) onUpdateSuccess();
      if (typeof onHide === 'function') {
        setTimeout(() => onHide(), 1000);
      }
    } catch (error) {
      const backendError = error.response?.data?.message;
      setErrorMessage(Array.isArray(backendError) ? backendError.join(', ') : backendError || 'Cập nhật thất bại. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setErrorMessage('Vui lòng nhập đầy đủ mật khẩu cũ, mật khẩu mới và xác nhận.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    setPasswordSubmitting(true);
    try {
      await userApi.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      setSuccessMessage('Đổi mật khẩu thành công!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      const backendError = error.response?.data?.message;
      setErrorMessage(Array.isArray(backendError) ? backendError.join(', ') : backendError || 'Đổi mật khẩu thất bại.');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleSwitchMode = async () => {
    setSwitching(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const response = await userApi.switchMode();
      const nextMode = response.data?.currentMode || response.data?.currentRole || 'Tenant';
      const token = response.data?.accessToken || response.data?.token;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('accessToken', token);
      }
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, currentMode: nextMode, role: nextMode };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setFormData((prev) => ({ ...prev, currentMode: nextMode, role: nextMode }));
      setSuccessMessage(response.data?.message || 'Đã đổi chế độ thành công!');
    } catch (error) {
      const backendError = error.response?.data?.message;
      setErrorMessage(Array.isArray(backendError) ? backendError.join(', ') : backendError || 'Không thể đổi chế độ.');
    } finally {
      setSwitching(false);
    }
  };

  const handleLogout = async () => {
    if (typeof onLogout === 'function') {
      await onLogout();
      return;
    }

    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.reload();
  };
const handleBack = () => {
    // 🟢 Đọc trực tiếp từ localStorage để biết người dùng đang ở mode nào
    const currentMode = localStorage.getItem('currentMode');
    
    // Hoặc nếu bạn lưu trong đối tượng user khác, có thể check cả role
    if (currentMode === 'Landlord') {
      navigate('/landlord'); // Quay lại trang quản lý của Landlord
    } else {
      navigate('/'); // Quay lại trang chủ của Tenant / Khách
    }
  };
  const content = (
    <div className={show !== undefined ? '' : 'py-3'}>
      {errorMessage && <Alert variant="danger" className="py-2 fs-7">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success" className="py-2 fs-7">{successMessage}</Alert>}

      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" size="sm" variant="primary" />
          <span className="ms-2 fs-7 text-muted">Đang tải dữ liệu...</span>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-4">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="text-center mb-3">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 64, height: 64, fontSize: 24 }}>
                    {formData.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <h5 className="fw-bold mb-1">{formData.username || 'Người dùng'}</h5>
                  <div className="d-flex justify-content-center gap-2 flex-wrap">
                    <Badge bg="primary">{formData.role || 'User'}</Badge>
                    <Badge bg="secondary">{formData.currentMode || 'Tenant'}</Badge>
                  </div>
                </div>
                <div className="small text-muted">
                  <div className="mb-2"><strong>Số điện thoại:</strong> {formData.phone || 'Chưa cập nhật'}</div>
                  <div><strong>Trạng thái:</strong> {formData.currentMode || 'Tenant'}</div>
                </div>
              </Card.Body>
            </Card>
          </div>

          <div className="col-lg-8">
            <Card className="border-0 shadow-sm mb-3">
              <Card.Body>
                <h6 className="fw-bold mb-3">Thông tin cá nhân</h6>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Tên đăng nhập</Form.Label>
                    <Form.Control type="text" value={formData.username} disabled readOnly className="bg-light" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Số điện thoại</Form.Label>
                    <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Nhập số điện thoại" className="fs-7" />
                  </Form.Group>
                  <div className="d-flex gap-2 flex-wrap">
                    <Button variant="primary" size="sm" type="submit" disabled={submitting || passwordSubmitting}>
                      {submitting ? <><Spinner animation="border" size="sm" className="me-1" />Đang lưu...</> : 'Cập nhật thông tin'}
                    </Button>
                    <Button variant="outline-secondary" size="sm" onClick={handleSwitchMode} disabled={switching || submitting || passwordSubmitting}>
                      {switching ? <Spinner animation="border" size="sm" className="me-1" /> : null}
                      Chuyển đổi vai trò
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="fw-bold mb-3">Đổi mật khẩu</h6>
                <Form onSubmit={handlePasswordSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Mật khẩu cũ</Form.Label>
                    <Form.Control type="password" name="oldPassword" value={passwordForm.oldPassword} onChange={handlePasswordChange} placeholder="Nhập mật khẩu cũ" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Mật khẩu mới</Form.Label>
                    <Form.Control type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} placeholder="Nhập mật khẩu mới" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Xác nhận mật khẩu mới</Form.Label>
                    <Form.Control type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} placeholder="Nhập lại mật khẩu mới" />
                  </Form.Group>
                  <div className="d-flex gap-2 flex-wrap">
                    <Button variant="outline-danger" size="sm" type="submit" disabled={passwordSubmitting || submitting || switching}>
                      {passwordSubmitting ? <><Spinner animation="border" size="sm" className="me-1" />Đang đổi...</> : 'Đổi mật khẩu'}
                    </Button>
                    <Button variant="outline-secondary" size="sm" onClick={handleLogout} disabled={submitting || passwordSubmitting || switching}>
                      Đăng xuất
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </div>
      )}
    </div>
  );

  if (show !== undefined) {
    return (
      <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold text-primary">👤 Hồ sơ cá nhân</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-3">{content}</Modal.Body>
      </Modal>
    );
  }

  return (
    <div className="container py-4">
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Hồ sơ cá nhân</h5>
            <Button variant="outline-secondary" size="sm" onClick={handleBack}>← Quay lại trang chủ</Button>
          </div>
          {content}
        </Card.Body>
      </Card>
    </div>
  );
};

export default UserProfile;