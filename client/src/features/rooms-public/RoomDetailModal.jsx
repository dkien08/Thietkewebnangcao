// File: client/src/features/rooms-public/RoomDetailModal.jsx
import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Spinner, Alert, Badge, Row, Col } from 'react-bootstrap';
import { EnvironmentOutlined, DollarOutlined, CalendarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '../../api/roomApi';
import { contractApi } from '../../api/contractApi';

const RoomDetailModal = ({ roomId, show, onHide }) => {
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (show && roomId) {
      fetchRoomDetail();
      const today = new Date();
      const sixMonthsLater = new Date();
      sixMonthsLater.setMonth(today.getMonth() + 6);

      setStartDate(today.toISOString().split('T')[0]);
      setEndDate(sixMonthsLater.toISOString().split('T')[0]);
      setError('');
      setSuccessMsg('');
    }
  }, [show, roomId]);

  const fetchRoomDetail = async () => {
    setLoading(true);
    try {
      const res = await roomApi.getDetail(roomId);
      setRoom(res.data || res);
    } catch (err) {
      console.error('Lỗi lấy chi tiết phòng:', err);
      setError('Không thể lấy thông tin phòng trọ.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContract = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError('Vui lòng chọn ngày bắt đầu và ngày kết thúc thuê.');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError('Ngày kết thúc phải lớn hơn ngày bắt đầu thuê.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Payload đồng bộ chính xác với DTO Backend
      const payload = {
        roomId: Number(roomId),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        price: Number(room?.price || 0),
      };

      await contractApi.createContract(payload);

      setSuccessMsg('Gửi yêu cầu thuê phòng thành công! Đang chuyển sang trang hợp đồng...');

      setTimeout(() => {
        onHide();
        navigate('/contracts');
      }, 1200);

    } catch (err) {
      console.error('Lỗi tạo hợp đồng:', err);
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg || 'Không thể tạo yêu cầu thuê phòng.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">Chi Tiết Phòng Trọ & Đăng Ký Thuê</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {error && <Alert variant="danger">{error}</Alert>}
        {successMsg && <Alert variant="success">{successMsg}</Alert>}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Đang tải thông tin phòng...</p>
          </div>
        ) : room ? (
          <div>
            <div className="mb-3 text-center bg-light rounded p-2" style={{ maxHeight: '280px', overflow: 'hidden' }}>
              <img
                src={room.images?.[0]?.imageUrl || '/placeholder-room.jpg'}
                alt={room.title}
                style={{ width: '100%', maxHeight: '260px', objectFit: 'cover' }}
                className="rounded"
              />
            </div>

            <h4 className="fw-bold">{room.title}</h4>
            <p className="text-muted">
              <EnvironmentOutlined className="me-1" />
              {room.addressDetail || room.district}, {room.district}
            </p>

            <Row className="bg-light p-3 rounded mb-3">
              <Col md={6}>
                <h5 className="text-primary fw-bold mb-1">
                  <DollarOutlined /> {Number(room.price || 0).toLocaleString('vi-VN')} đ/tháng
                </h5>
                <small className="text-muted">Diện tích: {room.area || 0} m²</small>
              </Col>
              <Col md={6} className="d-flex align-items-center gap-2">
                {room.hasAc && <Badge bg="info">Điều hòa</Badge>}
                {room.hasWm && <Badge bg="warning">Máy giặt</Badge>}
                <Badge bg={room.status === 'Available' ? 'success' : 'secondary'}>
                  {room.status === 'Available' ? 'Còn trống' : room.status}
                </Badge>
              </Col>
            </Row>

            <p><strong>Mô tả:</strong> {room.description || 'Chưa có mô tả chi tiết.'}</p>

            <hr />

            <h5 className="fw-bold mb-3"><CalendarOutlined /> Tạo Hợp Đồng Đăng Ký Thuê</h5>
            <Form onSubmit={handleCreateContract}>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label className="fw-bold">Ngày bắt đầu thuê</Form.Label>
                    <Form.Control
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label className="fw-bold">Ngày kết thúc hợp đồng</Form.Label>
                    <Form.Control
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <Button variant="secondary" onClick={onHide} disabled={submitting}>
                  Hủy
                </Button>
                <Button variant="primary" type="submit" disabled={submitting || room.status !== 'Available'}>
                  {submitting ? <Spinner size="sm" animation="border" /> : <><CheckCircleOutlined /> Gửi Yêu Cầu Thuê Phòng</>}
                </Button>
              </div>
            </Form>
          </div>
        ) : (
          <p className="text-center text-muted">Không tìm thấy thông tin phòng.</p>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default RoomDetailModal;