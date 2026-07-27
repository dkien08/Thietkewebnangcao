import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { roomApi } from '../../api/roomApi';
import toast from 'react-hot-toast';

const RoomCard = ({ room, onViewDetail, onFavoriteToggle }) => {
  // Trạng thái tim (mặc định kiểm tra thuộc tính isFavorite hoặc isLiked từ API)
  const [isFav, setIsFav] = useState(room?.isFavorite || room?.isLiked || false);
  const [loading, setLoading] = useState(false);

  // Xử lý khi click vào nút trái tim
const handleToggleFavorite = async (e) => {
  e.stopPropagation(); // Ngăn chặn nổi sự kiện mở modal chi tiết
  if (loading) return;

  console.log("Đang thực hiện đổi trạng thái yêu thích cho phòng:", room.id);
  setLoading(true);

  try {
    if (isFav) {
      // Bỏ yêu thích
      await roomApi.removeFavorite(room.id);
      setIsFav(false);
      if (typeof toast !== 'undefined' && toast.success) {
        toast.success('Đã bỏ khỏi danh sách yêu thích');
      }
    } else {
      // Thêm vào yêu thích
      await roomApi.addFavorite(room.id);
      setIsFav(true);
      if (typeof toast !== 'undefined' && toast.success) {
        toast.success('Đã thêm vào danh sách yêu thích');
      }
    }

    // Báo về cho component cha (nếu cần xử lý thêm)
    if (typeof onFavoriteToggle === 'function') {
      onFavoriteToggle(room.id, !isFav);
    }
  } catch (err) {
    console.error("Lỗi API Favorite chi tiết:", err.response || err);
    const errorMsg = err.response?.data?.message || 'Vui lòng đăng nhập để lưu phòng yêu thích!';
    if (typeof toast !== 'undefined' && toast.error) {
      toast.error(errorMsg);
    } else {
      alert(errorMsg); // Fallback nếu chưa cấu hình toast
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <Card 
      className="h-100 shadow-sm border-0 hover-card" 
      style={{ cursor: 'pointer', overflow: 'hidden' }}
      onClick={() => onViewDetail(room.id)}
    >
      {/* Khung chứa ảnh & Nút tim */}
      <div style={{ position: 'relative', height: '180px', backgroundColor: '#f8fafc' }}>
        <Card.Img
          variant="top"
          src={room?.images?.[0]?.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
          style={{ objectFit: 'cover', height: '100%', width: '100%' }}
        />

        {/* 🔴 Nút trái tim nhỏ nổi ở góc trên bên phải */}
        <button
          onClick={handleToggleFavorite}
          disabled={loading}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            border: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 2,
            transition: 'transform 0.15s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.9)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          title={isFav ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
        >
          {isFav ? (
            <HeartFilled style={{ color: '#ef4444', fontSize: '18px' }} />
          ) : (
            <HeartOutlined style={{ color: '#64748b', fontSize: '18px' }} />
          )}
        </button>
      </div>

      <Card.Body>
        <h6 className="fw-bold text-dark text-truncate mb-2">{room.title}</h6>
        <p className="text-muted small mb-2">{room.addressDetail || room.district}</p>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <span className="text-danger fw-bold fs-6">
            {Number(room.price).toLocaleString('vi-VN')} đ/tháng
          </span>
          <span className="text-muted small">{room.area} m²</span>
        </div>
      </Card.Body>
    </Card>
  );
};

export default RoomCard;