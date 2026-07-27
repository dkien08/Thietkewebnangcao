// client/src/pages/LandlordDashboard.jsx
import React, { useEffect, useState } from 'react';
import { 
  Table, Button, Container, Badge, Spinner, Alert, Dropdown, Card, Row, Col, Modal, Form, Toast, ToastContainer 
} from 'react-bootstrap';
import {
  FileTextOutlined, PlusOutlined, UserOutlined,
  LogoutOutlined, SwapOutlined, BarChartOutlined, AppstoreOutlined,
  CheckCircleOutlined, CloseCircleOutlined, StopOutlined, EditOutlined, DeleteOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '../api/roomApi';
import { userApi } from '../api/userApi';
import axiosClient from '../api/axiosClient';
import './Home.css';
import { PictureOutlined } from '@ant-design/icons';
import RoomImageManagementModal from '../features/rooms-public/RoomImageManagementModal';



const LandlordDashboard = ({ onLogout }) => {

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedRoomForImages, setSelectedRoomForImages] = useState(null);

  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('rooms');
  const [rooms, setRooms] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [reports, setReports] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [error, setError] = useState('');
  
  const [profile, setProfile] = useState({ username: 'Chủ nhà', role: 'Landlord', phone: '' });

  // --- STATE DÀNH CHO TOAST NOTIFICATION (THÔNG BÁO TRÊN MÀN HÌNH) ---
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const showToast = (message, variant = 'success') => setToast({ show: true, message, variant });

  // --- STATE DÀNH CHO MODAL XÁC NHẬN (THAY CHO WINDOW.CONFIRM) ---
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, variant: 'primary' });
  const openConfirmModal = (title, message, onConfirm, variant = 'danger') => {
    setConfirmModal({ show: true, title, message, onConfirm, variant });
  };
  const closeConfirmModal = () => setConfirmModal({ show: false, title: '', message: '', onConfirm: null, variant: 'primary' });

  // --- STATE DÀNH CHO MODAL ĐĂNG / SỬA PHÒNG TRỌ ---
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null); // null: Đăng mới, object: Sửa phòng
  const [roomFormData, setRoomFormData] = useState({
    title: '',
    addressDetail: '',
    district: '',
    price: '',
    area: '',
    description: '',
    status: 'Available'
  });

  // Tải thông tin Profile
  const loadProfile = async () => {
    try {
      const response = await userApi.getProfile();
      setProfile(response.data?.data || response.data || response);
    } catch (err) {
      console.warn('Không lấy được profile:', err);
    }
  };

  // Tải danh sách phòng
  const loadLandlordRooms = async () => {
    try {
      const res = await roomApi.getLandlordRooms();
      const data = res.data?.data || res.data || [];
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi lấy danh sách phòng:', err);
      setError('Chưa thể tải danh sách phòng của bạn.');
    }
  };

  // Tải danh sách hợp đồng
  const loadLandlordContracts = async () => {
    setLoadingContracts(true);
    try {
      const res = await axiosClient.get('/contracts/landlord');
      const rawData = res.data?.data || res.data || [];
      setContracts(Array.isArray(rawData) ? rawData : []);
    } catch (err) {
      console.error('Lỗi lấy hợp đồng:', err);
    } finally {
      setLoadingContracts(false);
    }
  };

  // Tải báo cáo
  const loadLandlordReports = async () => {
    setLoadingReports(true);
    try {
      const res = await axiosClient.get('/reports/landlord');
      setReports(res.data?.data || res.data || null);
    } catch (err) {
      console.error('Lỗi lấy thống kê báo cáo:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await loadProfile();
      await Promise.all([
        loadLandlordRooms(), 
        loadLandlordContracts(),
        loadLandlordReports()
      ]);
      setLoading(false);
    };
    initData();
  }, []);

  const refreshAllData = () => {
    loadLandlordRooms();
    loadLandlordContracts();
    loadLandlordReports();
  };

  // --- XỬ LÝ ĐĂNG / SỬA PHÒNG TRỌ ---
  const handleOpenCreateModal = () => {
    setEditingRoom(null);
    setRoomFormData({ title: '', addressDetail: '', district: '', price: '', area: '', description: '', status: 'Available' });
    setShowRoomModal(true);
  };

  const handleOpenEditModal = (room) => {
    setEditingRoom(room);
    setRoomFormData({
      title: room.title || '',
      addressDetail: room.addressDetail || '',
      district: room.district || '',
      price: room.price || '',
      area: room.area || '',
      description: room.description || '',
      status: room.status || 'Available'
    });
    setShowRoomModal(true);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        // Cập nhật phòng (F12)
        await roomApi.updateRoom(editingRoom.id, roomFormData);
        showToast('Cập nhật thông tin phòng trọ thành công!', 'success');
      } else {
        // Đăng phòng mới (F10)
        await roomApi.createRoom(roomFormData);
        showToast('Đăng bài phòng trọ mới thành công!', 'success');
      }
      setShowRoomModal(false);
      refreshAllData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin phòng.', 'danger');
    }
  };

  // --- XỬ LÝ XÓA PHÒNG TRỌ (F13) ---
  const handleDeleteRoom = (roomId) => {
    openConfirmModal(
      'Xác nhận xóa phòng',
      'Bạn có chắc chắn muốn XÓA bài đăng phòng trọ này? Hành động này không thể hoàn tác.',
      async () => {
        try {
          await roomApi.deleteRoom(roomId);
          showToast('Đã xóa bài đăng phòng trọ thành công!', 'success');
          refreshAllData();
        } catch (err) {
          showToast(err.response?.data?.message || 'Lỗi khi xóa phòng trọ.', 'danger');
        }
      }
    );
  };
// --- XỬ LÝ QUẢN LÝ ẢNH PHÒNG TRỌ ---
  const handleOpenImageModal = (room) => {
  setSelectedRoomForImages(room);
  setShowImageModal(true);
};

  // --- XỬ LÝ PHÊ DUYỆT / TỪ CHỐI / CHẤM DỨT HỢP ĐỒNG ---
  const handleApprove = (id) => {
    openConfirmModal(
      'Duyệt yêu cầu thuê',
      'Bạn có chắc chắn muốn PHÊ DUYỆT yêu cầu thuê này?',
      async () => {
        try {
          await axiosClient.put(`/contracts/${id}/approve`);
          showToast('Đã phê duyệt hợp đồng thành công!', 'success');
          refreshAllData();
        } catch (err) {
          showToast(err.response?.data?.message || 'Lỗi khi phê duyệt hợp đồng.', 'danger');
        }
      },
      'success'
    );
  };

  const handleReject = (id) => {
    openConfirmModal(
      'Từ chối yêu cầu thuê',
      'Bạn có chắc chắn muốn TỪ CHỐI yêu cầu thuê này?',
      async () => {
        try {
          await axiosClient.put(`/contracts/${id}/reject`);
          showToast('Đã từ chối yêu cầu thuê.', 'warning');
          refreshAllData();
        } catch (err) {
          showToast(err.response?.data?.message || 'Lỗi khi từ chối hợp đồng.', 'danger');
        }
      },
      'danger'
    );
  };

  const handleTerminate = (id) => {
    openConfirmModal(
      'Chấm dứt hợp đồng',
      'Bạn có chắc chắn muốn CHẤM DỨT hợp đồng này? Phòng trọ sẽ quay lại trạng thái CÒN TRỐNG.',
      async () => {
        try {
          await axiosClient.put(`/contracts/${id}/terminate`);
          showToast('Đã chấm dứt hợp đồng và giải phóng phòng!', 'success');
          refreshAllData();
        } catch (err) {
          showToast(err.response?.data?.message || 'Lỗi khi chấm dứt hợp đồng.', 'danger');
        }
      },
      'danger'
    );
  };

  const handleSwitchMode = async () => {
    try {
      const res = await userApi.switchMode(); 
      if (res.data?.accessToken || res.accessToken) {
        localStorage.setItem('token', res.data?.accessToken || res.accessToken);
      }
      window.location.href = '/';
    } catch (error) {
      console.error('Lỗi khi chuyển đổi vai trò:', error);
    }
  };

  const handleLogout = () => {
  // 1. Xóa sạch token xác thực khỏi localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('accessToken');
  
  // 2. Điều hướng thẳng về trang Đăng nhập hoặc trang Home công khai
  navigate('/login'); // Hoặc navigate('/') nếu muốn về trang chủ khách
};

  // --- TÍNH TOÁN CÁC DỮ LIỆU THỐNG KÊ MỚI NHẤT TRỰC TIẾP TỪ ARRAY ROOMS ---
  const totalRoomsCount = rooms.length;
  const availableRoomsCount = rooms.filter(r => r.status === 'Available').length;
  const rentedRoomsCount = rooms.filter(r => r.status === 'Rented').length;
  const occupancyPercentage = totalRoomsCount > 0 ? Math.round((rentedRoomsCount / totalRoomsCount) * 100) : 0;

  const activeContracts = contracts.filter(c => String(c.status || '').toUpperCase() === 'ACTIVE');
  const calculatedRevenue = activeContracts.reduce((sum, c) => sum + Number(c.price || c.room?.price || 0), 0);
  const totalRevenueDisplay = reports?.totalMonthlyRevenue ?? calculatedRevenue;

  const pendingCount = contracts.filter(c => String(c.status || '').toUpperCase() === 'PENDING').length;
  const currentUserId = Number(profile?.id ?? profile?.userId ?? 0);

  return (
    <div className="home-shell">
      {/* TOAST NOTIFICATION CONTAINER (GÓC MÀN HÌNH) */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast 
          onClose={() => setToast({ ...toast, show: false })} 
          show={toast.show} 
          delay={4000} 
          autohide 
          bg={toast.variant}
        >
          <Toast.Header className="text-dark font-weight-bold">
            <strong className="me-auto">Thông báo Hệ thống</strong>
          </Toast.Header>
          <Toast.Body className="text-white fw-bold">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* SIDEBAR LANDLORD */}
      <aside className="home-sidebar" style={{ background: '#1e293b' }}>
        <div className="sidebar-brand">
          <div className="brand-icon" style={{ background: '#10b981' }}>LL</div>
          <div>
            <h2>ROOM RENT</h2>
            <p className="text-warning">Kênh Chủ Nhà (Landlord)</p>
          </div>
        </div>

        <div className="sidebar-menu">
          <button 
            type="button" 
            className={`menu-item ${activeTab === 'rooms' ? 'active' : ''}`} 
            onClick={() => setActiveTab('rooms')}
          >
            <AppstoreOutlined /> Quản lý phòng trọ
          </button>
          
          <button 
            type="button" 
            className={`menu-item ${activeTab === 'contracts' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('contracts'); loadLandlordContracts(); }}
          >
            <FileTextOutlined /> Yêu cầu thuê / Hợp đồng 
            {pendingCount > 0 && <Badge bg="danger" className="ms-2">{pendingCount}</Badge>}
          </button>
          
          <button 
            type="button" 
            className={`menu-item ${activeTab === 'reports' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('reports'); loadLandlordReports(); }}
          >
            <BarChartOutlined /> Thống kê doanh thu
          </button>
        </div>
      </aside>

      <main className="home-main">
        {/* HEADER */}
        <header className="home-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 className="mb-0 font-weight-bold">Bảng Quản Lý Cho Thuê</h4>
            <small className="text-muted">Quản lý bài đăng, trạng thái phòng và duyệt hợp đồng</small>
          </div>

          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Dropdown align="end">
              <Dropdown.Toggle variant="light" id="dropdown-profile-landlord" className="user-pill border-0 d-flex align-items-center gap-2 bg-white shadow-sm py-2 px-3 rounded-pill">
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserOutlined />
                </div>
                <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', display: 'block' }}>{profile.username || 'Chủ nhà'}</span>
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold' }}>Mode: Landlord</span>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu style={{ minWidth: '220px', padding: '8px', borderRadius: '10px' }}>
                <Dropdown.Header className="text-muted" style={{ fontSize: '12px' }}>Tài khoản Chủ nhà</Dropdown.Header>
                <div className="px-3 py-2 border-bottom mb-2">
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{profile.username}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>SĐT: {profile.phone || 'Chưa cập nhật'}</div>
                </div>
                <Dropdown.Item onClick={() => navigate('/profile')} className="rounded py-2">
                  <UserOutlined className="me-2" /> Hồ sơ cá nhân
                </Dropdown.Item>
                <Dropdown.Item onClick={handleSwitchMode} className="rounded py-2 text-success font-weight-bold">
                  <SwapOutlined className="me-2" /> Chuyển sang Người thuê (Tenant)
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger rounded py-2">
                  <LogoutOutlined className="me-2" /> Đăng xuất
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </header>

        {/* NỘI DUNG CHÍNH */}
        <Container fluid className="mt-4 px-0">
          {/* THỐNG KÊ NHANH (CARDS DÙNG DATA MỚI) */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="shadow-sm border-0 bg-primary text-white">
                <Card.Body>
                  <h5>Tổng phòng sở hữu</h5>
                  <h2 className="mb-0 font-weight-bold">{totalRoomsCount}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm border-0 bg-success text-white">
                <Card.Body>
                  <h5>Phòng còn trống</h5>
                  <h2 className="mb-0 font-weight-bold">{availableRoomsCount}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm border-0 bg-secondary text-white">
                <Card.Body>
                  <h5>Phòng đã cho thuê</h5>
                  <h2 className="mb-0 font-weight-bold">{rentedRoomsCount}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm border-0 bg-warning text-dark">
                <Card.Body>
                  <h5>Yêu cầu chờ duyệt</h5>
                  <h2 className="mb-0 font-weight-bold">{pendingCount}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {error && <Alert variant="danger">{error}</Alert>}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
              <div className="mt-2 text-muted">Đang tải dữ liệu dashboard...</div>
            </div>
          ) : (
            <>
              {/* TAB 1: QUẢN LÝ PHÒNG TRỌ */}
              {activeTab === 'rooms' && (
                <Card className="shadow-sm border-0">
                  <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
                    <h5 className="mb-0 font-weight-bold">Danh sách bài đăng phòng trọ</h5>
                    <Button variant="success" onClick={handleOpenCreateModal}>
                      <PlusOutlined className="me-1" /> Đăng phòng trọ mới
                    </Button>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <Table striped bordered hover responsive className="mb-0 align-middle">
                      <thead className="bg-light">
                        <tr>
                          <th>#</th>
                          <th>Tiêu đề bài đăng</th>
                          <th>Khu vực</th>
                          <th>Giá thuê</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rooms.length === 0 ? (
                          <tr><td colSpan="6" className="text-center py-4 text-muted">Bạn chưa đăng bài phòng trọ nào.</td></tr>
                        ) : (
                          rooms.map((room, index) => {
                            const isOwner = Number(room.landlordId) === currentUserId || !room.landlordId;

                            return (
                              <tr key={room.id}>
  <td>{index + 1}</td>
  <td><strong>{room.title}</strong></td>
  <td>{room.addressDetail || room.district}</td>
  <td>{Number(room.price).toLocaleString('vi-VN')} đ/tháng</td>
  <td>
    <Badge bg={room.status === 'Available' ? 'success' : room.status === 'Rented' ? 'secondary' : 'warning'}>
      {room.status === 'Available' ? 'Còn trống' : room.status === 'Rented' ? 'Đã thuê' : 'Bảo trì'}
    </Badge>
  </td>
  <td>
    {isOwner ? (
      <>
        {/* Nút Sửa */}
        <Button 
          variant="outline-primary" 
          size="sm" 
          className="me-2" 
          onClick={() => handleOpenEditModal(room)}
        >
          <EditOutlined /> Sửa
        </Button>

        {/* Nút Quản lý Ảnh (Mới thêm) */}
        <Button 
          variant="outline-info" 
          size="sm" 
          className="me-2" 
          onClick={() => handleOpenImageModal(room)}
        >
          <PictureOutlined /> Ảnh
        </Button>

        {/* Nút Xóa */}
        <Button 
          variant="outline-danger" 
          size="sm" 
          onClick={() => handleDeleteRoom(room.id)}
        >
          <DeleteOutlined /> Xóa
        </Button>
      </>
    ) : (
      <span className="text-muted small">Chỉ xem</span>
    )}
  </td>
</tr>
                            );
                          })
                        )}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              )}

              {/* TAB 2: QUẢN LÝ YÊU CẦU THUÊ / HỢP ĐỒNG */}
              {activeTab === 'contracts' && (
                <Card className="shadow-sm border-0">
                  <Card.Header className="bg-white py-3">
                    <h5 className="mb-0 font-weight-bold">Danh sách Yêu cầu thuê & Hợp đồng gửi tới bạn</h5>
                  </Card.Header>
                  <Card.Body className="p-0">
                    {loadingContracts ? (
                      <div className="text-center py-4"><Spinner animation="border" size="sm" /> Đang tải danh sách hợp đồng...</div>
                    ) : (
                      <Table striped bordered hover responsive className="mb-0 align-middle">
                        <thead className="bg-light">
                          <tr>
                            <th>Mã HĐ</th>
                            <th>Phòng trọ</th>
                            <th>Người thuê (Tenant)</th>
                            <th>SĐT liên hệ</th>
                            <th>Giá thuê</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contracts.length === 0 ? (
                            <tr><td colSpan="7" className="text-center py-4 text-muted">Chưa có yêu cầu thuê phòng nào gửi tới bạn.</td></tr>
                          ) : (
                            contracts.map((item) => {
                              const statusUpper = String(item.status || '').toUpperCase();
                              return (
                                <tr key={item.id}>
                                  <td><strong>#{item.id}</strong></td>
                                  <td>{item.room?.title || `Phòng #${item.roomId}`}</td>
                                  <td>{item.tenant?.username || 'Khách thuê'}</td>
                                  <td>{item.tenant?.phone || 'Chưa cập nhật'}</td>
                                  <td>{Number(item.price || item.room?.price || 0).toLocaleString('vi-VN')} đ</td>
                                  <td>
                                    <Badge bg={
                                      statusUpper === 'ACTIVE' ? 'success' :
                                      statusUpper === 'PENDING' ? 'warning' : 'danger'
                                    }>
                                      {statusUpper === 'ACTIVE' ? 'Đang hiệu lực' :
                                       statusUpper === 'PENDING' ? 'Chờ duyệt' : 'Đã chấm dứt/Từ chối'}
                                    </Badge>
                                  </td>
                                  <td>
                                    {statusUpper === 'PENDING' && (
                                      <div className="d-flex gap-2">
                                        <Button variant="success" size="sm" onClick={() => handleApprove(item.id)}>
                                          <CheckCircleOutlined /> Duyệt
                                        </Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => handleReject(item.id)}>
                                          <CloseCircleOutlined /> Từ chối
                                        </Button>
                                      </div>
                                    )}

                                    {statusUpper === 'ACTIVE' && (
                                      <Button variant="outline-danger" size="sm" onClick={() => handleTerminate(item.id)}>
                                        <StopOutlined /> Chấm dứt HĐ
                                      </Button>
                                    )}

                                    {statusUpper !== 'PENDING' && statusUpper !== 'ACTIVE' && (
                                      <span className="text-muted small">Đã kết thúc</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </Table>
                    )}
                  </Card.Body>
                </Card>
              )}

              {/* TAB 3: THỐNG KÊ DOANH THU */}
              {activeTab === 'reports' && (
                <Card className="shadow-sm border-0">
                  <Card.Header className="bg-white py-3">
                    <h5 className="mb-0 font-weight-bold">Báo Cáo Thống Kê Doanh Thu</h5>
                  </Card.Header>
                  <Card.Body>
                    {loadingReports ? (
                      <div className="text-center py-4"><Spinner animation="border" size="sm" /> Đang tải dữ liệu báo cáo...</div>
                    ) : (
                      <Row>
                        <Col md={4} className="mb-3">
                          <div className="p-3 border rounded bg-light">
                            <small className="text-muted d-block">Tổng số phòng sở hữu</small>
                            <h3 className="text-primary font-weight-bold mb-0">{totalRoomsCount}</h3>
                          </div>
                        </Col>
                        <Col md={4} className="mb-3">
                          <div className="p-3 border rounded bg-light">
                            <small className="text-muted d-block">Tỷ lệ lấp đầy</small>
                            <h3 className="text-success font-weight-bold mb-0">{occupancyPercentage}%</h3>
                          </div>
                        </Col>
                        <Col md={4} className="mb-3">
                          <div className="p-3 border rounded bg-light">
                            <small className="text-muted d-block">Doanh thu thực tế hàng tháng</small>
                            <h3 className="text-danger font-weight-bold mb-0">
                              {Number(totalRevenueDisplay).toLocaleString('vi-VN')} đ
                            </h3>
                          </div>
                        </Col>
                      </Row>
                    )}
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </Container>
      </main>

      {/* ========================================================= */}
      {/* MODAL THÊM / SỬA PHÒNG TRỌ (MÀN HÌNH POPUP) */}
      {/* ========================================================= */}
      <Modal show={showRoomModal} onHide={() => setShowRoomModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="font-weight-bold">
            {editingRoom ? 'Sửa thông tin phòng trọ' : 'Đăng phòng trọ mới'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveRoom}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Tiêu đề bài đăng (*)</Form.Label>
              <Form.Control 
                type="text" 
                required 
                placeholder="VD: Phòng trọ khép kín đầy đủ tiện nghi tại Cầu Giấy"
                value={roomFormData.title}
                onChange={(e) => setRoomFormData({ ...roomFormData, title: e.target.value })}
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="fw-bold">Quận / Huyện (*)</Form.Label>
                <Form.Control 
                  type="text" 
                  required 
                  placeholder="VD: Cầu Giấy"
                  value={roomFormData.district}
                  onChange={(e) => setRoomFormData({ ...roomFormData, district: e.target.value })}
                />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold">Địa chỉ chi tiết (*)</Form.Label>
                <Form.Control 
                  type="text" 
                  required 
                  placeholder="VD: Số 12 Ngõ 80 Xuân Thủy"
                  value={roomFormData.addressDetail}
                  onChange={(e) => setRoomFormData({ ...roomFormData, addressDetail: e.target.value })}
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Label className="fw-bold">Giá thuê (VNĐ/tháng) (*)</Form.Label>
                <Form.Control 
                  type="number" 
                  required 
                  placeholder="VD: 3500000"
                  value={roomFormData.price}
                  onChange={(e) => setRoomFormData({ ...roomFormData, price: e.target.value })}
                />
              </Col>
              <Col md={4}>
                <Form.Label className="fw-bold">Diện tích (m²) (*)</Form.Label>
                <Form.Control 
                  type="number" 
                  required 
                  placeholder="VD: 25"
                  value={roomFormData.area}
                  onChange={(e) => setRoomFormData({ ...roomFormData, area: e.target.value })}
                />
              </Col>
              <Col md={4}>
                <Form.Label className="fw-bold">Trạng thái phòng</Form.Label>
                <Form.Select 
                  value={roomFormData.status}
                  onChange={(e) => setRoomFormData({ ...roomFormData, status: e.target.value })}
                >
                  <option value="Available">Còn trống (Available)</option>
                  <option value="Rented">Đã thuê (Rented)</option>
                  <option value="Maintenance">Bảo trì (Maintenance)</option>
                </Form.Select>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Mô tả chi tiết</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                placeholder="Nhập thông tin giờ giấc, nội thất, tiện ích..."
                value={roomFormData.description}
                onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRoomModal(false)}>Hủy bỏ</Button>
            <Button variant="success" type="submit">
              {editingRoom ? 'Lưu cập nhật' : 'Đăng phòng'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
      
      <RoomImageManagementModal
        show={showImageModal}
        onHide={() => setShowImageModal(false)}
        room={selectedRoomForImages}
        onUpdateSuccess={() => {
          loadLandlordRooms
        }}
      />

      {/* ========================================================= */}
      {/* MODAL XÁC NHẬN THAO TÁC (THAY CHO WINDOW.CONFIRM) */}
      {/* ========================================================= */}
      <Modal show={confirmModal.show} onHide={closeConfirmModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="font-weight-bold">{confirmModal.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{confirmModal.message}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeConfirmModal}>Hủy</Button>
          <Button 
            variant={confirmModal.variant} 
            onClick={async () => {
              if (typeof confirmModal.onConfirm === 'function') {
                await confirmModal.onConfirm();
              }
              closeConfirmModal();
            }}
          >
            Đồng ý
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LandlordDashboard;