import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { EyeOutlined, EnvironmentOutlined, PictureOutlined } from '@ant-design/icons';

const RoomCard = ({ room, onViewDetail, onManageImages, isLandlord = false }) => {
  // Đường dẫn ảnh hiển thị đại diện
  const defaultImage = 'https://via.placeholder.com/300x200?text=Khong+Co+Anh';
  const coverImage = room.images && room.images.length > 0 ? room.images[0].imageUrl : defaultImage;

  return (
    <Card className="h-100 shadow-sm border-0 overflow-hidden hover-shadow">
      <div className="position-relative" style={{ height: '180px' }}>
        <Card.Img
          variant="top"
          src={coverImage}
          alt={room.title}
          style={{ height: '100%', objectFit: 'cover' }}
        />
        <Badge
          bg={room.status === 'Available' ? 'success' : 'secondary'}
          className="position-absolute top-0 end-0 m-2 px-2 py-1"
        >
          {room.status === 'Available' ? 'Còn trống' : room.status}
        </Badge>
      </div>

      <Card.Body className="d-flex flex-column">
        <Card.Title className="fs-6 fw-bold text-truncate" title={room.title}>
          {room.title}
        </Card.Title>

        <Card.Text className="text-danger fw-bold fs-5 mb-1">
          {Number(room.price).toLocaleString('vi-VN')} VNĐ/tháng
        </Card.Text>

        <div className="small text-muted mb-2">
          <EnvironmentOutlined className="me-1" />
          {room.district} - {room.area} m²
        </div>

        <div className="d-flex gap-1 mb-3">
          {room.hasAc && <Badge bg="info" text="dark">Điều hòa</Badge>}
          {room.hasWm && <Badge bg="warning" text="dark">Máy giặt</Badge>}
        </div>

        <div className="mt-auto d-flex gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            className="w-100"
            onClick={() => onViewDetail(room.id)}
          >
            <EyeOutlined className="me-1" /> Chi tiết
          </Button>

          {/* Nút dành cho Chủ nhà muốn quản lý ảnh */}
          {isLandlord && (
            <Button
              variant="outline-dark"
              size="sm"
              onClick={() => onManageImages(room)}
              title="Quản lý bộ sưu tập ảnh"
            >
              <PictureOutlined />
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default RoomCard;