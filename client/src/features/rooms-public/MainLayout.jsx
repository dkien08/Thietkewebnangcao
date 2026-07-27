import React, { useEffect, useState } from 'react';
import { Nav, Form, Table, Button, Badge, Dropdown, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { 
  HomeOutlined, BarChartOutlined, FileTextOutlined, CalendarOutlined, 
  SearchOutlined, BellOutlined, UserOutlined, EyeOutlined,
  PictureOutlined, HeartOutlined, HeartFilled
} from '@ant-design/icons';
import { roomApi } from '../../api/roomApi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import RoomDetailModal from './RoomDetailModal';
import RoomImageManagementModal from './RoomImageManagementModal';
import { userApi } from '../../api/userApi';

const MainLayout = ({ onLogout }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('2025_2026_3,2');
  const [selectedDistrict, setSelectedDistrict] = useState('Tất cả');
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  });
  const [favoritesCount, setFavoritesCount] = useState(0);

  const loadRooms = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError('');

      const response = selectedDistrict !== 'Tất cả'
        ? await roomApi.searchRooms({ district: selectedDistrict })
        : await roomApi.getAllAvailable();

      setRooms(response.data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách phòng:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách phòng từ server.');
      setRooms([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDistrict]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const res = await roomApi.getFavorites();
        setFavoritesCount((res.data || []).length);
      } catch (err) {
        // ignore
      }
    };
    loadFavorites();
  }, []);

  const isTenant = currentUser && (currentUser.currentMode === 'Tenant' || currentUser.role === 'Tenant');

  const handleToggleFavorite = async (roomId) => {
    try {
      await roomApi.toggleFavorite(roomId);
      // update count by fetching again (simple approach)
      const res = await roomApi.getFavorites();
      setFavoritesCount((res.data || []).length);
      toast.success('Cập nhật yêu thích thành công');
    } catch (err) {
      toast.error('Thao tác yêu thích thất bại');
    }
  };

  const handleSwitchMode = async () => {
    try {
      const response = await userApi.switchMode();
      const nextMode = response.data?.currentMode || response.data?.currentRole || 'Tenant';
      const token = response.data?.accessToken || response.data?.token;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('accessToken', token);
      }
      const updatedUser = { ...currentUser, currentMode: nextMode, role: nextMode };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      window.alert(response.data?.message || 'Đã đổi chế độ thành công!');
    } catch (err) {
      const backendError = err.response?.data?.message;
      window.alert(Array.isArray(backendError) ? backendError.join(', ') : backendError || 'Không thể đổi chế độ.');
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

  // State Modal
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRoomForImages, setSelectedRoomForImages] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#eef2f5' }}>
      
      {/* ==================== 1. SIDEBAR BÊN TRÁI ==================== */}
      <div style={{ width: '250px', backgroundColor: '#1a233a', color: '#fff' }} className="d-flex flex-column p-3">
        {/* Tenant sidebar */}
        {isTenant ? (
          <>
            {/* Search box for tenant */}
            <div className="mb-3">
              <Form.Control
                type="search"
                placeholder="Tìm phòng, địa chỉ, từ khoá..."
                size="sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = e.target.value.trim();
                    if (val) navigate(`/rooms?q=${encodeURIComponent(val)}`);
                  }
                }}
                className="rounded-pill bg-dark text-white border-0"
                style={{ backgroundColor: '#131a2c !important' }}
              />
            </div>

            <hr className="border-secondary my-2" />

            <Nav className="flex-column gap-2">
              <Nav.Link onClick={() => navigate('/')} className="text-white d-flex align-items-center gap-2">
                <HomeOutlined /> Trang chủ
              </Nav.Link>
              <Nav.Link onClick={() => navigate('/my-rooms')} className="text-white d-flex align-items-center gap-2">
                <EyeOutlined /> Phòng đã thuê
              </Nav.Link>
              <Nav.Link onClick={() => navigate('/contracts')} className="text-white d-flex align-items-center gap-2">
                <FileTextOutlined /> Hợp đồng
              </Nav.Link>
              <Nav.Link onClick={() => navigate('/favorites')} className="text-white d-flex align-items-center gap-2">
                <HeartOutlined /> Yêu thích
              </Nav.Link>
            </Nav>
          </>
        ) : (
          // Original owner sidebar
          <>
            {/* Logo Phenikaa */}
            <div className="text-center my-3">
              <div className="fw-bold fs-4 text-uppercase tracking-wider" style={{ color: '#f36f21' }}>
                PHENIKAA
              </div>
              <small className="text-light opacity-75 style-letter-spacing">UNIVERSITY</small>
            </div>

            <hr className="border-secondary my-2" />

            {/* Menu Điều Hướng */}
            <Nav className="flex-column gap-1 mt-2">
              <Nav.Link className="text-white opacity-75 d-flex align-items-center gap-2">
                <HomeOutlined /> Trang chủ
              </Nav.Link>
              <Nav.Link className="text-white opacity-75 d-flex align-items-center gap-2">
                <BarChartOutlined /> Thống kê
              </Nav.Link>
              <Nav.Link className="text-white opacity-75 d-flex align-items-center gap-2">
                <EyeOutlined /> Giám sát phòng
              </Nav.Link>

              {/* Menu đang Active */}
              <div className="mt-3">
                <div className="fw-bold px-3 py-2 rounded text-warning d-flex align-items-center gap-2" style={{ backgroundColor: '#28334e' }}>
                  <CalendarOutlined /> Quản lý phòng trọ (TV2)
                </div>
                <div className="ps-4 mt-1 fs-7">
                  <div className="py-1 text-warning fw-semibold style-cursor-pointer">
                    • Danh sách phòng trống (F04)
                  </div>
                  <div className="py-1 text-white opacity-50 style-cursor-pointer">• Lịch sử đặt phòng</div>
                  <div className="py-1 text-white opacity-50 style-cursor-pointer">• Báo cáo sự cố</div>
                </div>
              </div>

              <Nav.Link className="text-white opacity-75 d-flex align-items-center gap-2 mt-3">
                <FileTextOutlined /> Hợp đồng & Văn bản
              </Nav.Link>
            </Nav>
          </>
        )}
      </div>

      {/* ==================== CONTENT KHU VỰC PHẢI ==================== */}
      <div className="flex-grow-1 d-flex flex-column">
        
        {/* ==================== 2. HEADER TOPBAR ==================== */}
        <div className="d-flex justify-content-between align-items-center px-4 py-2" style={{ backgroundColor: '#202b46', color: '#fff' }}>
          {/* Thanh tìm kiếm topbar */}
          <div className="position-relative" style={{ width: '350px' }}>
            <Form.Control
              type="text"
              placeholder="Tìm kiếm chức năng..."
              className="bg-dark text-white border-0 rounded-pill px-3 py-1 fs-7"
              style={{ backgroundColor: '#131a2c !important' }}
            />
            <SearchOutlined className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary" />
          </div>

          {/* Thông báo & User */}
          <div className="d-flex align-items-center gap-3">
            <BellOutlined className="fs-5 style-cursor-pointer" />
            <Dropdown>
              <Dropdown.Toggle size="sm" variant="outline-light" className="border-0 px-2">
                <span className="d-flex align-items-center gap-2">
                  <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                    <UserOutlined />
                  </div>
                  <span className="fs-7 fw-semibold">{currentUser.username || 'Tài khoản'}</span>
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => navigate('/profile')}>👤 Hồ sơ cá nhân</Dropdown.Item>
                <Dropdown.Item onClick={handleSwitchMode}>🔄 Chuyển đổi vai trò</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>🚪 Đăng xuất</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {/* Breadcrumb đường dẫn */}
        <div className="px-4 py-2 bg-white border-bottom fs-7 text-muted">
          Quản lý phòng trọ &gt; <span className="fw-bold text-dark">Danh sách phòng trọ theo khu vực</span>
        </div>

        {/* ==================== 3. KHU VỰC BẢNG NỘI DUNG CHÍNH ==================== */}
        <div className="p-4 flex-grow-1">
          <div className="bg-white rounded shadow-sm p-4">
            
            {/* Thanh Filter Điều kiện (Chuẩn khung hình mẫu) */}
            <Row className="align-items-center g-3 mb-4">
              <Col auto className="d-flex align-items-center gap-2">
                <span className="fw-semibold fs-7 text-muted">Thời gian</span>
                <Form.Select 
                  size="sm" 
                  value={selectedPeriod} 
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  style={{ width: '160px' }}
                >
                  <option value="2025_2026_3,2">2025_2026_3,2</option>
                  <option value="2025_2026_1,2">2025_2026_1,2</option>
                </Form.Select>
              </Col>

              <Col auto className="d-flex align-items-center gap-2">
                <span className="fw-semibold fs-7 text-muted">Khu vực</span>
                <Form.Select 
                  size="sm" 
                  value={selectedDistrict} 
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  style={{ width: '180px' }}
                >
                  <option value="Tất cả">Chọn quận/huyện</option>
                  <option value="Cầu Giấy">Cầu Giấy</option>
                  <option value="Nam Từ Liêm">Nam Từ Liêm</option>
                </Form.Select>
              </Col>

              <Col className="d-flex justify-content-end gap-2">
                <Button size="sm" style={{ backgroundColor: '#1d2742', borderColor: '#1d2742' }} onClick={() => loadRooms(true)}>
                  <SearchOutlined className="me-1" /> Danh sách
                </Button>
                <Button size="sm" style={{ backgroundColor: '#1d2742', borderColor: '#1d2742' }} onClick={() => loadRooms(true)}>
                  Lọc phòng trống
                </Button>
                <Dropdown>
                  <Dropdown.Toggle size="sm" variant="outline-secondary">
                    Báo cáo
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item>Xuất Excel</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            </Row>

            {error && (
              <Alert variant="danger" className="mb-3">{error}</Alert>
            )}

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <div className="mt-2 text-muted">Đang tải dữ liệu phòng từ server...</div>
              </div>
            ) : (
              <Table responsive hover className="align-middle text-center fs-7 border">
                <thead className="table-light text-muted fw-semibold">
                  <tr>
                    <th>STT</th>
                    <th>Yêu thích</th>
                    <th>Mã phòng</th>
                    <th className="text-start">Tên phòng / Địa chỉ</th>
                    <th>Giá thuê</th>
                    <th>Ngày cập nhật</th>
                    <th>Diện tích</th>
                    <th>Trạng thái</th>
                    <th>Chi tiết</th>
                    <th>Quản lý ảnh</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4 text-muted">
                        Không có phòng nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    rooms.map((room, index) => {
                      const roomStatus = room.status === 'Available' ? 'Còn trống' : room.status === 'Rented' ? 'Đã thuê' : 'Bảo trì';
                      const statusVariant = room.status === 'Available' ? 'success' : room.status === 'Rented' ? 'secondary' : 'warning';
                      const roomCode = room.code || `ROOM${String(room.id).padStart(3, '0')}`;
                      const updatedAt = room.createdAt ? new Date(room.createdAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật';

                      return (
                        <tr key={room.id}>
                          <td>{index + 1}</td>
                          <td>
                            <Button variant="link" className="p-0" onClick={() => handleToggleFavorite(room.id)}>
                              <HeartOutlined style={{ color: '#ff6b81', fontSize: 18, opacity: 0.85 }} />
                            </Button>
                          </td>
                          <td className="fw-bold text-secondary">{roomCode}</td>
                          <td className="text-start fw-semibold text-primary">
                            <div>{room.title}</div>
                            <div className="small text-muted">{room.addressDetail || room.district}</div>
                          </td>
                          <td className="text-danger fw-bold">{Number(room.price).toLocaleString('vi-VN')} đ</td>
                          <td>{updatedAt}</td>
                          <td>{room.area} m²</td>
                          <td>
                            <Badge bg={statusVariant} className="fw-normal px-2 py-1">{roomStatus}</Badge>
                          </td>
                          <td>
                            <Button 
                              size="sm" 
                              variant="light" 
                              className="border text-primary me-1"
                              onClick={() => { setSelectedRoomId(room.id); setShowDetailModal(true); }}
                            >
                              <EyeOutlined />
                            </Button>
                          </td>
                          <td>
                            <Button 
                              size="sm" 
                              variant="light" 
                              className="border text-dark"
                              onClick={() => { setSelectedRoomForImages(room); setShowImageModal(true); }}
                            >
                              <PictureOutlined />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            )}

          </div>
        </div>

      </div>

      {/* Modals hỗ trợ */}
      <RoomDetailModal
        roomId={selectedRoomId}
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
      />

      <RoomImageManagementModal
        room={selectedRoomForImages}
        show={showImageModal}
        onHide={() => setShowImageModal(false)}
        onRefresh={() => loadRooms(false)}
      />
    </div>
  );
};

export default MainLayout;