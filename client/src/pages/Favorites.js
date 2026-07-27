import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Card, Button } from 'react-bootstrap';
import { HeartFilled, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import RoomCard from '../features/rooms-public/RoomCard';
import RoomDetailModal from '../features/rooms-public/RoomDetailModal';
import { roomApi } from '../api/roomApi';
import toast from 'react-hot-toast';

const Favorites = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await roomApi.getFavorites();
      // Bóc tách dữ liệu an toàn phòng hờ cấu trúc trả về dạng [{ room: {...} }, ...] hoặc trực tiếp [...]
      const rawData = res.data?.data || res.data || [];
      
      const formattedRooms = rawData.map(item => item.room ? item.room : item);
      setRooms(formattedRooms);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // Callback hỗ trợ lọc phòng khỏi danh sách ngay khi người dùng bỏ yêu thích
  const handleRemoveFavorite = (removedRoomId) => {
    setRooms((prev) => prev.filter((room) => room.id !== removedRoomId));
    toast.success('Đã bỏ phòng khỏi danh sách yêu thích');
  };

  return (
    <Container className="py-4">
      {/* Header Tiêu Đề */}
      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
        <div className="d-flex align-items-center">
          <div 
            className="d-flex align-items-center justify-content-center rounded-circle me-3"
            style={{ width: '42px', height: '42px', backgroundColor: '#fef2f2' }}
          >
            <HeartFilled style={{ fontSize: '22px', color: '#ef4444' }} />
          </div>
          <div>
            <h3 className="mb-0 fw-bold text-dark">Danh sách yêu thích</h3>
            <small className="text-muted">Các phòng trọ bạn đã lưu để xem lại</small>
          </div>
        </div>

        {rooms.length > 0 && (
          <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill fs-6 fw-semibold">
            {rooms.length} phòng đã lưu
          </span>
        )}
      </div>

      {/* Nội dung danh sách */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
          <p className="mt-2 text-muted small">Đang tải danh sách bài đăng yêu thích...</p>
        </div>
      ) : rooms.length === 0 ? (
        <Card className="p-5 text-center shadow-sm border-0 bg-light my-3">
          <Card.Body>
            <div 
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{ width: '70px', height: '70px', backgroundColor: '#e2e8f0' }}
            >
              <HomeOutlined style={{ fontSize: '32px', color: '#64748b' }} />
            </div>
            <h5 className="fw-bold text-dark">Chưa có phòng trọ nào trong danh sách</h5>
            <p className="text-muted mx-auto" style={{ maxWidth: '400px' }}>
              Hãy nhấn vào biểu tượng trái tim ở các bài đăng phòng trọ để lưu lại những nơi bạn ưng ý nhất!
            </p>
            <Button variant="primary" className="px-4 py-2 mt-2" onClick={() => navigate('/')}>
              Khám phá phòng trọ ngay
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {rooms.map((room) => (
            // 🟢 Thêm key tường minh và an toàn
            <Col key={room.id || room.roomId} xs={12} sm={6} md={4} lg={3}>
              <RoomCard
                room={room}
                onViewDetail={(id) => {
                  setSelectedRoomId(id);
                  setShowDetail(true);
                }}
                onFavoriteToggle={handleRemoveFavorite}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Modal chi tiết phòng */}
      <RoomDetailModal
        roomId={selectedRoomId}
        show={showDetail}
        onHide={() => setShowDetail(false)}
      />
    </Container>
  );
};

export default Favorites;