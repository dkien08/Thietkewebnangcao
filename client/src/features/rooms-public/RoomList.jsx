import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import RoomFilter from './RoomFilter';
import RoomCard from './RoomCard';
import RoomDetailModal from './RoomDetailModal';
import RoomImageManagementModal from './RoomImageManagementModal';
import { roomsApi } from './roomsApi';
import toast from 'react-hot-toast';

const RoomList = ({ isLandlord = false }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Quan lý Modal
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [selectedRoomForImages, setSelectedRoomForImages] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Tải danh sách phòng trọ trống (F04)
  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await roomsApi.getAllAvailable();
      setRooms(res.data);
    } catch {
      toast.error('Không thể kết nối đến máy chủ để tải danh sách phòng!');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Xử lý Lọc tìm kiếm (F06)
  const handleSearch = async (filters) => {
    setLoading(true);
    try {
      const res = await roomsApi.searchRooms(filters);
      setRooms(res.data);
      toast.success(`Tìm thấy ${res.data.length} phòng phù hợp`);
    } catch {
      toast.error('Lỗi khi lọc tìm kiếm phòng trọ!');
    } finally {
      setLoading(false);
    }
  };

  // Xem chi tiết (F05)
  const handleViewDetail = (id) => {
    setSelectedRoomId(id);
    setShowDetailModal(true);
  };

  // Mở quản lý ảnh (F19, F20)
  const handleManageImages = (room) => {
    setSelectedRoomForImages(room);
    setShowImageModal(true);
  };

  return (
    <Container className="py-4">
      {/* Thanh Lọc */}
      <RoomFilter onSearch={handleSearch} onReset={fetchRooms} />

      {/* Danh Sách Phòng */}
      <h4 className="fw-bold mb-3 text-dark">Danh sách phòng trọ đang trống</h4>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Đang tải danh sách phòng...</p>
        </div>
      ) : rooms.length > 0 ? (
        <Row className="g-4">
          {rooms.map((room) => (
            <Col key={room.id} xs={12} sm={6} md={4} lg={3}>
              <RoomCard
                room={room}
                onViewDetail={handleViewDetail}
                onManageImages={handleManageImages}
                isLandlord={isLandlord}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center py-5 bg-white rounded shadow-sm">
          <p className="text-muted mb-0">Không tìm thấy phòng trọ nào phù hợp với yêu cầu.</p>
        </div>
      )}

      {/* Modals */}
      <RoomDetailModal
        roomId={selectedRoomId}
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
      />

      <RoomImageManagementModal
        room={selectedRoomForImages}
        show={showImageModal}
        onHide={() => setShowImageModal(false)}
        onRefresh={fetchRooms}
      />
    </Container>
  );
};

export default RoomList;