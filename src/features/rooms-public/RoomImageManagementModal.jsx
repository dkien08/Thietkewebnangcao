import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Card } from 'react-bootstrap';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { roomsApi } from './roomsApi';
import toast from 'react-hot-toast';

const RoomImageManagementModal = ({ room, show, onHide, onRefresh }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!room) return null;

  // Thêm ảnh mới (F19)
  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      toast.error('Vui lòng nhập URL hình ảnh');
      return;
    }

    setLoading(true);
    try {
      await roomsApi.uploadImage(room.id, { imageUrl });
      toast.success('Thêm ảnh phòng trọ thành công!');
      setImageUrl('');
      onRefresh(); // Tải lại danh sách
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi thêm ảnh');
    } finally {
      setLoading(false);
    }
  };

  // Xóa ảnh (F20)
  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh này?')) return;

    try {
      await roomsApi.deleteImage(room.id, imageId);
      toast.success('Xóa ảnh thành công!');
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa ảnh');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="fs-5 fw-bold">Quản lý bộ sưu tập ảnh - {room.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Form thêm URL ảnh */}
        <Form onSubmit={handleAddImage} className="mb-4 p-3 bg-light rounded">
          <Form.Group className="mb-2">
            <Form.Label className="fw-semibold">Thêm link ảnh mới (URL):</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Button variant="success" type="submit" disabled={loading} style={{ minWidth: '120px' }}>
                <PlusOutlined className="me-1" /> Thêm ảnh
              </Button>
            </div>
          </Form.Group>
        </Form>

        {/* Danh sách ảnh hiện tại */}
        <h6 className="fw-bold mb-3">Danh sách ảnh đã tải lên ({room.images?.length || 0}):</h6>
        <Row className="g-3">
          {room.images && room.images.length > 0 ? (
            room.images.map((img) => (
              <Col key={img.id} xs={6} md={4}>
                <Card className="position-relative overflow-hidden border">
                  <Card.Img
                    src={img.imageUrl}
                    style={{ height: '130px', objectFit: 'cover' }}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    className="position-absolute top-0 end-0 m-1 rounded-circle p-1 d-flex align-items-center justify-content-center"
                    style={{ width: '28px', height: '28px' }}
                    onClick={() => handleDeleteImage(img.id)}
                    title="Xóa ảnh này"
                  >
                    <DeleteOutlined />
                  </Button>
                </Card>
              </Col>
            ))
          ) : (
            <p className="text-muted text-center py-3">Chưa có ảnh nào trong bộ sưu tập.</p>
          )}
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RoomImageManagementModal;