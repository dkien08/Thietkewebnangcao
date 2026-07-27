// client/src/pages/Home.js
import React, { useEffect, useMemo, useState } from 'react';
import { Row, Col, Button, Form, Spinner, Badge, InputGroup, Alert, Dropdown, Toast, ToastContainer } from 'react-bootstrap';
import {
  SearchOutlined, HomeOutlined, FileTextOutlined, HeartOutlined,
  UserOutlined, LogoutOutlined, BellOutlined, EnvironmentOutlined,
  SwapOutlined, EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '../api/roomApi';
import { userApi } from '../api/userApi';
import RoomDetailModal from '../features/rooms-public/RoomDetailModal';
import RoomCard  from '../features/rooms-public/RoomCard';
import './Home.css';

const districtOptions = ['Tất cả', 'Nam Từ Liêm', 'Cầu Giấy', 'Bắc Từ Liêm', 'Đống Đa', 'Hoàn Kiếm'];
const priceOptions = [
  { label: 'Không giới hạn', value: 10000000 },
  { label: 'Dưới 2.000.000đ', value: 2000000 },
  { label: 'Dưới 4.000.000đ', value: 4000000 },
  { label: 'Dưới 6.000.000đ', value: 6000000 },
  { label: 'Dưới 8.000.000đ', value: 8000000 },
];

const formatMoney = (val) => Number(val || 0).toLocaleString('vi-VN');

const Home = ({ onLogout }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [district, setDistrict] = useState('Tất cả');
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [hasAc, setHasAc] = useState(false);
  const [hasWm, setHasWm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [profile, setProfile] = useState({ username: 'Người dùng', role: 'Tenant', phone: '', currentMode: 'Tenant' });
  const [toastInfo, setToastInfo] = useState({ show: false, message: '', variant: 'success' });

  const showToast = (message, variant = 'success') => setToastInfo({ show: true, message, variant });

  const loadProfile = async () => {
    try {
      const response = await userApi.getProfile();
      const user = response.data || response;
      setProfile(user);
    } catch (err) {
      console.warn('Không lấy được profile:', err);
    }
  };

  const loadRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (district && district !== 'Tất cả') params.district = district;
      if (maxPrice && maxPrice < 10000000) params.maxPrice = maxPrice;
      if (hasAc) params.has_ac = true;
      if (hasWm) params.has_wm = true;

      const response = await roomApi.searchRooms(params);
      setRooms(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách phòng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    loadRooms();
  }, []);

  // Xử lý Switch Mode từ Tenant -> Landlord
  const handleSwitchMode = async () => {
  try {
    const response = await userApi.switchMode();
    const data = response.data || response;

    const newToken = data.accessToken;
    if (newToken) {
      // Lưu đồng thời cả 2 key để phòng hờ các file API gọi khác nhau
      localStorage.setItem('token', newToken);
      localStorage.setItem('accessToken', newToken);
    }

    // 🟢 Thay vì dùng navigate('/landlord'), hãy dùng window.location.href để reload hẳn token mới
    window.location.href = '/landlord';
    
  } catch (err) {
    console.error('Lỗi chuyển đổi mode:', err);
    alert(err.response?.data?.message || 'Không thể chuyển đổi chế độ lúc này.');
  }
};

  const filteredRooms = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    return rooms.filter((room) => {
      const matchesSearch =
        !keyword ||
        [room.title, room.district, room.addressDetail, room.description]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(keyword));

      const matchesAc = !hasAc || room.hasAc;
      const matchesWm = !hasWm || room.hasWm;
      const matchesPrice = !maxPrice || Number(room.price) <= maxPrice;

      return matchesSearch && matchesAc && matchesWm && matchesPrice;
    });
  }, [rooms, searchText, hasAc, hasWm, maxPrice]);

  const handleExit = async () => {
    if (typeof onLogout === 'function') {
      await onLogout();
      return;
    }
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="home-shell">
      {/* TOAST THÔNG BÁO TẠI GÓC MÀN HÌNH */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast onClose={() => setToastInfo({ ...toastInfo, show: false })} show={toastInfo.show} delay={3000} autohide bg={toastInfo.variant}>
          <Toast.Header><strong className="me-auto">Hệ thống</strong></Toast.Header>
          <Toast.Body className="text-white">{toastInfo.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* SIDEBAR TENANT */}
      <aside className="home-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">RR</div>
          <div>
            <h2>ROOM RENT</h2>
            <p>Kênh Người Thuê Phòng</p>
          </div>
        </div>

        <div className="sidebar-menu">
          <button type="button" className="menu-item active" onClick={() => navigate('/')}>
            <HomeOutlined /> Trang chủ
          </button>
          <button type="button" className="menu-item" onClick={() => navigate('/my-rooms')}>
            <EyeOutlined /> Phòng đã thuê
          </button>
          {/* <button type="button" className="menu-item" onClick={() => navigate('/contracts')}>
            <FileTextOutlined /> Hợp đồng
          </button> */}
          <button type="button" className="menu-item" onClick={() => navigate('/favorites')}>
            <HeartOutlined /> Yêu thích
          </button>
        </div>
      </aside>

      <main className="home-main">
        {/* HEADER TENANT */}
        <header className="home-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '70%' }}>
              <InputGroup>
                <Form.Control
                  type="search"
                  placeholder="Tìm kiếm phòng trọ, khu vực..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') loadRooms(); }}
                  className="rounded-pill"
                />
                <Button variant="primary" onClick={loadRooms} style={{ marginLeft: 8 }}>
                  <SearchOutlined />
                </Button>
              </InputGroup>
            </div>
          </div>

          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="user-pill" style={{ cursor: 'pointer' }}>
              <BellOutlined /> <span>Thông báo</span>
            </div>

            {/* DROPDOWN USER */}
            <Dropdown align="end">
              <Dropdown.Toggle variant="light" id="dropdown-profile" className="user-pill border-0 d-flex align-items-center gap-2 bg-white shadow-sm py-2 px-3 rounded-pill">
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserOutlined />
                </div>
                <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', display: 'block' }}>{profile.username || 'Tài khoản'}</span>
                  <span style={{ fontSize: '11px', color: '#0d6efd' }}>Mode: Tenant (Người thuê)</span>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu style={{ minWidth: '220px', padding: '8px', borderRadius: '10px' }}>
                <Dropdown.Header className="text-muted" style={{ fontSize: '12px' }}>Tài khoản của tôi</Dropdown.Header>
                <div className="px-3 py-2 border-bottom mb-2">
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{profile.username}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>SĐT: {profile.phone || 'Chưa cập nhật'}</div>
                </div>
                <Dropdown.Item onClick={() => navigate('/profile')} className="rounded py-2">
                  <UserOutlined className="me-2" /> Hồ sơ cá nhân
                </Dropdown.Item>
                <Dropdown.Item onClick={handleSwitchMode} className="rounded py-2 text-primary font-weight-bold">
                  <SwapOutlined className="me-2" /> Chuyển sang Chủ nhà (Landlord)
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleExit} className="text-danger rounded py-2">
                  <LogoutOutlined className="me-2" /> Đăng xuất
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </header>

        {/* LỌC PHÒNG */}
        <section className="home-filter-panel mt-3">
          <div className="filter-grid">
            <div>
              <label>Quận / Huyện</label>
              <Form.Select value={district} onChange={(e) => setDistrict(e.target.value)}>
                {districtOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </Form.Select>
            </div>
            <div>
              <label>Giá tối đa</label>
              <Form.Select value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}>
                {priceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </Form.Select>
            </div>
            <div className="filter-checkboxes">
              <Form.Check type="checkbox" id="ac" label="Điều hòa" checked={hasAc} onChange={() => setHasAc((prev) => !prev)} />
              <Form.Check type="checkbox" id="wm" label="Máy giặt" checked={hasWm} onChange={() => setHasWm((prev) => !prev)} />
            </div>
            <div>
              <label>Tìm kiếm nhanh</label>
              <InputGroup>
                <Form.Control type="search" placeholder="Tên phòng, địa chỉ..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                <Button variant="primary" onClick={loadRooms}><SearchOutlined /></Button>
              </InputGroup>
            </div>
          </div>
        </section>

        {/* DANH SÁCH PHÒNG TÌM KIẾM */}
<section className="home-content mt-4">
  {error && <Alert variant="danger">{error}</Alert>}
  {loading ? (
    <div className="text-center py-5">
      <Spinner animation="border" />
      <div className="mt-2 text-muted">Đang tải phòng...</div>
    </div>
  ) : (
    <div className="room-grid">
      {filteredRooms.length === 0 ? (
        <div className="empty-state">Không tìm thấy phòng phù hợp.</div>
      ) : (
        filteredRooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onViewDetail={(id) => {
              setSelectedRoomId(id);
              setShowDetailModal(true);
            }}
          />
        ))
      )}
    </div>
  )}
</section>
      </main>

      <RoomDetailModal roomId={selectedRoomId} show={showDetailModal} onHide={() => setShowDetailModal(false)} />
    </div>
  );
};

export default Home;