import React, { useState } from 'react';
import { Navbar, Nav, Form, Table, Button, Badge, Dropdown, Row, Col } from 'react-bootstrap';
import { 
  HomeOutlined, BarChartOutlined, FileTextOutlined, CalendarOutlined, 
  SearchOutlined, BellOutlined, UserOutlined, EditOutlined, EyeOutlined,
  PictureOutlined, ReloadOutlined
} from '@ant-design/icons';
import RoomDetailModal from './RoomDetailModal';
import RoomImageManagementModal from './RoomImageManagementModal';

const MainLayout = () => {
  // Mock data dữ liệu phòng trọ để hiển thị mượt mà trên UI mẫu
  const [rooms, setRooms] = useState([
    {
      id: 1,
      code: "ROOM001",
      title: "Phòng trọ cao cấp Cầu Giấy (Khép kín)",
      district: "Cầu Giấy",
      price: 3500000,
      area: 25,
      status: "Available",
      startDate: "18/05/2026",
      endDate: "26/07/2026",
      hasAc: true,
      hasWm: true,
      images: [{ id: 101, imageUrl: "https://picsum.photos/400/300" }],
      landlord: { username: "Nguyễn Lệ Thu", phone: "0987654321" }
    },
    {
      id: 2,
      code: "ROOM002",
      title: "Phòng trọ sinh viên Nam Từ Liêm",
      district: "Nam Từ Liêm",
      price: 2200000,
      area: 18,
      status: "Available",
      startDate: "11/05/2026",
      endDate: "26/07/2026",
      hasAc: false,
      hasWm: true,
      images: [],
      landlord: { username: "Đăng Đức Kiên", phone: "0912345678" }
    }
  ]);

  // State Modal
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRoomForImages, setSelectedRoomForImages] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState("2025_2026_3,2");
  const [selectedDistrict, setSelectedDistrict] = useState("Tất cả");

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#eef2f5' }}>
      
      {/* ==================== 1. SIDEBAR BÊN TRÁI ==================== */}
      <div style={{ width: '250px', backgroundColor: '#1a233a', color: '#fff' }} className="d-flex flex-column p-3">
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
            <div className="d-flex align-items-center gap-2 border-start ps-3 border-secondary">
              <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                <UserOutlined />
              </div>
              <span className="fs-7 fw-semibold">Nguyễn Lệ Thu</span>
            </div>
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
                <Button size="sm" style={{ backgroundColor: '#1d2742', borderColor: '#1d2742' }}>
                  <SearchOutlined className="me-1" /> Danh sách
                </Button>
                <Button size="sm" style={{ backgroundColor: '#1d2742', borderColor: '#1d2742' }}>
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

            {/* BẢNG DỮ LIỆU PHÒNG TRỌ (Bố cục như hình mẫu) */}
            <Table responsive hover className="align-middle text-center fs-7 border">
              <thead className="table-light text-muted fw-semibold">
                <tr>
                  <th>STT</th>
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
                {rooms.map((room, index) => (
                  <tr key={room.id}>
                    <td>{index + 1}</td>
                    <td className="fw-bold text-secondary">{room.code}</td>
                    <td className="text-start fw-semibold text-primary">{room.title}</td>
                    <td className="text-danger fw-bold">{Number(room.price).toLocaleString('vi-VN')} đ</td>
                    <td>{room.startDate}</td>
                    <td>{room.area} m²</td>
                    <td>
                      <Badge bg="success" className="fw-normal px-2 py-1">Còn trống</Badge>
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
                ))}
              </tbody>
            </Table>

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
        onRefresh={() => {}}
      />
    </div>
  );
};

export default MainLayout;