import React, { useEffect, useState } from 'react';
import { Modal, Button, Carousel, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { PhoneOutlined, EnvironmentOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { roomsApi } from './roomsApi';
import toast from 'react-hot-toast';

const RoomDetailModal = ({ roomId, show, onHide }) => {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (roomId && show) {
      setLoading(true);
      roomsApi
        .getDetail(roomId)
        .then((res) => {
          setRoom(res.data);
        })
        .catch(() => {
          toast.error('Không thể tải thông tin chi tiết phòng trọ');
        })
        .finally(() => setLoading(false));
    }
  }, [roomId, show]);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="fs-5 fw-bold text-primary">Chi tiết phòng trọ</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
          </div>
        ) : room ? (
          <Row className="g-4">
            {/* Bộ sưu tập ảnh */}
            <Col md={6}>
              {room.images && room.images.length > 0 ? (
                <Carousel className="rounded overflow-hidden shadow-sm">
                  {room.images.map((img) => (
                    <Carousel.Item key={img.id}>
                      <img
                        className="d-block w-100"
                        src={img.imageUrl}
                        alt="Ảnh phòng"
                        style={{ height: '260px', objectFit: 'cover' }}
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              ) : (
                <div
                  className="bg-light rounded d-flex align-items-center justify-content-center text-muted"
                  style={{ height: '260px' }}
                >
                  Chưa có ảnh mô tả
                </div>
              )}
            </Col>

            {/* Thông tin phòng */}
            <Col md={6}>
              <h4 className="fw-bold">{room.title}</h4>
              <h5 className="text-danger fw-bold my-2">
                {Number(room.price).toLocaleString('vi-VN')} VNĐ/tháng
              </h5>

              <p className="text-muted mb-2">
                <EnvironmentOutlined className="me-1" />
                {room.addressDetail}, {room.district}
              </p>

              <div className="d-flex gap-3 my-2">
                <span><strong>Diện tích:</strong> {room.area} m²</span>
                <span>
                  <strong>Trạng thái: </strong>
                  <Badge bg={room.status === 'Available' ? 'success' : 'secondary'}>
                    {room.status === 'Available' ? 'Còn trống' : room.status}
                  </Badge>
                </span>
              </div>

              <div className="my-3">
                <strong className="d-block mb-1">Tiện nghi có sẵn:</strong>
                <div className="d-flex gap-2">
                  {room.hasAc && (
                    <Badge bg="info" text="dark">
                      <CheckCircleOutlined className="me-1" />Điều hòa
                    </Badge>
                  )}
                  {room.hasWm && (
                    <Badge bg="warning" text="dark">
                      <CheckCircleOutlined className="me-1" />Máy giặt
                    </Badge>
                  )}
                  {!room.hasAc && !room.hasWm && <span className="text-muted small">Không có</span>}
                </div>
              </div>

              {/* SĐT Chủ nhà */}
              <div className="p-3 bg-light rounded border border-info mt-3">
                <div className="small text-muted">Thông tin liên hệ chủ nhà:</div>
                <div className="fw-bold fs-6 text-dark">
                  {room.landlord?.username || 'Chủ nhà'}
                </div>
                <div className="text-primary fw-bold fs-5 mt-1">
                  <PhoneOutlined className="me-2" />
                  {room.landlord?.phone || 'Chưa cập nhật SĐT'}
                </div>
              </div>
            </Col>

            {/* Mô tả chi tiết */}
            <Col md={12}>
              <h6 className="fw-bold">Mô tả phòng:</h6>
              <p className="text-secondary style-whitespace" style={{ whitespace: 'pre-line' }}>
                {room.description || 'Chưa có thông tin mô tả chi tiết từ chủ nhà.'}
              </p>
            </Col>
          </Row>
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RoomDetailModal;