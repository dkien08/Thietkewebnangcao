// client/src/components/FavouriteButton.jsx
import React, { useState } from 'react';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { favouriteApi } from '../api/favouriteApi';

const FavouriteButton = ({ roomId, isInitialFav = false, onToggle }) => {
  const [isFav, setIsFav] = useState(isInitialFav);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e) => {
    e.stopPropagation(); // Tránh kích hoạt sự kiện click mở trang chi tiết phòng
    if (loading) return;

    setLoading(true);
    try {
      if (isFav) {
        await favouriteApi.removeFavourite(roomId);
        setIsFav(false);
      } else {
        await favouriteApi.addFavourite(roomId);
        setIsFav(true);
      }
      
      // Gọi callback báo cho parent component nếu cần
      if (typeof onToggle === 'function') {
        onToggle(roomId, !isFav);
      }
    } catch (err) {
      console.error('Lỗi khi thao tác Favourite:', err);
      alert(err.response?.data?.message || 'Bạn cần đăng nhập để lưu phòng yêu thích!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      style={{
        border: 'none',
        background: 'rgba(255, 255, 255, 0.85)',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        transition: 'all 0.2s ease',
      }}
      title={isFav ? 'Bỏ yêu thích' : 'Yêu thích phòng này'}
    >
      {isFav ? (
        <HeartFilled style={{ color: '#ef4444', fontSize: '18px' }} />
      ) : (
        <HeartOutlined style={{ color: '#64748b', fontSize: '18px' }} />
      )}
    </button>
  );
};

export default FavouriteButton;