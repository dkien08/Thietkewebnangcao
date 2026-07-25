import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col } from 'react-bootstrap';
import {
  Modal, Button, Dropdown, message, Input, Badge, Form as AntForm, Avatar,
  Table, Tag, Space, Popconfirm, Card as AntCard, InputNumber, Select, Progress, Slider, Switch, Empty
} from 'antd';
import {
  HomeOutlined, AppstoreOutlined, FileTextOutlined, UserOutlined, SearchOutlined,
  LockOutlined, EditOutlined, LogoutOutlined,
  SwapOutlined, HeartOutlined, HeartFilled, DeleteOutlined,
  BarChartOutlined, DownOutlined, BellOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  PlusOutlined, PictureOutlined, ToolOutlined, CheckCircleOutlined, CheckOutlined, CloseOutlined,
  ExportOutlined, KeyOutlined, EnvironmentOutlined
} from '@ant-design/icons';
import './Home.css';

// ==========================================
// 1. DỮ LIỆU MẪU BAN ĐẦU
// ==========================================
const INITIAL_ROOMS = [
  {
    id: 'P101',
    title: 'Studio Lê Đức Thọ Full Nội Thất',
    addressDetail: '121 Lê Đức Thọ',
    district: 'Nam Từ Liêm',
    price: 4500000,
    area: 28,
    hasAc: true,
    hasWm: true,
    status: 'RENTED',
    tenantName: 'Nguyễn Tuấn Anh',
    description: 'Phòng studio đầy đủ đồ, ban công thoáng mát, an ninh 24/7.',
    images: [{ id: 1, url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=80' }]
  },
  {
    id: 'P102',
    title: 'Căn hộ Mini 1PN Cầu Giấy',
    addressDetail: '45 Chùa Bộc',
    district: 'Cầu Giấy',
    price: 5200000,
    area: 35,
    hasAc: true,
    hasWm: false,
    status: 'AVAILABLE',
    tenantName: '',
    description: 'Cạnh các trường đại học lớn, giờ giấc tự do, không chung chủ.',
    images: [{ id: 2, url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=500&q=80' }]
  },
  {
    id: 'P103',
    title: 'Phòng Trọ Khép Kín Mỹ Đình',
    addressDetail: '88 Đình Thôn',
    district: 'Nam Từ Liêm',
    price: 3800000,
    area: 25,
    hasAc: true,
    hasWm: true,
    status: 'AVAILABLE',
    tenantName: '',
    description: 'Phòng rộng thoáng mát, có thang máy, chỗ để xe miễn phí.',
    images: [{ id: 3, url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=80' }]
  },
  {
    id: 'P104',
    title: 'Phòng Studio Ban Công Tây Hồ',
    addressDetail: '12 Đặng Thai Mai',
    district: 'Tây Hồ',
    price: 6000000,
    area: 32,
    hasAc: true,
    hasWm: true,
    status: 'MAINTENANCE',
    tenantName: '',
    description: 'Sắp sửa xong. Gần hồ Tây, view thoáng đãng, yên tĩnh.',
    images: [{ id: 4, url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=500&q=80' }]
  },
  {
    id: 'P105',
    title: 'Duplex Gác Xép Nguyễn Trãi',
    addressDetail: '234 Nguyễn Trãi',
    district: 'Thanh Xuân',
    price: 4200000,
    area: 30,
    hasAc: true,
    hasWm: true,
    status: 'AVAILABLE',
    tenantName: '',
    description: 'Thiết kế gác xép hiện đại, trần cao thoáng mát, ngay gần ga đường sắt trên cao.',
    images: [{ id: 5, url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=500&q=80' }]
  },
  {
    id: 'P106',
    title: 'Căn Hộ Dịch Vụ Cao Cấp Xã Đàn',
    addressDetail: '168 Xã Đàn',
    district: 'Đống Đa',
    price: 7500000,
    area: 40,
    hasAc: true,
    hasWm: true,
    status: 'AVAILABLE',
    tenantName: '',
    description: 'Nội thất sang trọng chuẩn 4 sao, dịch vụ dọn phòng 2 lần/tuần, trung tâm đắc địa.',
    images: [{ id: 6, url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=500&q=80' }]
  },
  {
    id: 'P107',
    title: 'Phòng Trọ Giá Rẻ Sinh Viên Trương Định',
    addressDetail: '55 Trương Định',
    district: 'Hoàng Mai',
    price: 2800000,
    area: 20,
    hasAc: false,
    hasWm: true,
    status: 'AVAILABLE',
    tenantName: '',
    description: 'Phòng sạch sẽ, giá cả hợp lý cho sinh viên Bách - Kinh - Xây, điện nước giá dân.',
    images: [{ id: 7, url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=500&q=80' }]
  }
];

const INITIAL_REQUESTS = [
  { id: 'REQ-101', roomId: 'P102', roomTitle: 'Căn hộ Mini 1PN Cầu Giấy', tenantName: 'Trần Văn Nam', tenantPhone: '0987654321', startDate: '2026-08-01', endDate: '2027-08-01', price: 5200000, status: 'PENDING' },
  { id: 'REQ-102', roomId: 'P105', roomTitle: 'Duplex Gác Xép Nguyễn Trãi', tenantName: 'Lê Thị Mai', tenantPhone: '0912345678', startDate: '2026-08-15', endDate: '2027-02-15', price: 4200000, status: 'PENDING' }
];

const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
};

// ==========================================
// 2. COMPONENT QUẢN LÝ PHÒNG (Dành cho Chủ nhà)
// ==========================================
const MyRoomsView = ({ rooms, setRooms }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedRoomForImages, setSelectedRoomForImages] = useState(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [form] = AntForm.useForm();

  const handleOpenAddModal = () => {
    setEditingRoom(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record) => {
    setEditingRoom(record);
    form.setFieldsValue({ ...record });
    setIsModalOpen(true);
  };

  const handleSubmitForm = (values) => {
    if (editingRoom) {
      setRooms(rooms.map(r => r.id === editingRoom.id ? { ...r, ...values } : r));
      message.success(`Đã cập nhật thông tin phòng #${editingRoom.id}!`);
    } else {
      const newRoom = {
        id: `P${Math.floor(100 + Math.random() * 900)}`,
        ...values,
        status: 'AVAILABLE',
        tenantName: '',
        images: [{ id: Date.now(), url: values.firstImageUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=80' }]
      };
      setRooms([newRoom, ...rooms]);
      message.success(`Đã tạo thành công phòng trọ mới #${newRoom.id}!`);
    }
    setIsModalOpen(false);
  };

  const handleDeleteRoom = (roomId) => {
    setRooms(rooms.filter((r) => r.id !== roomId));
    message.success(`Đã xóa bài đăng phòng #${roomId}!`);
  };

  const handleOpenImageModal = (room) => {
    setSelectedRoomForImages(room);
    setIsImageModalOpen(true);
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return message.error('Vui lòng nhập đường dẫn URL ảnh!');
    const newImg = { id: Date.now(), url: newImageUrl.trim() };
    const updated = rooms.map(r => r.id === selectedRoomForImages.id ? { ...r, images: [...r.images, newImg] } : r);
    setRooms(updated);
    setSelectedRoomForImages({ ...selectedRoomForImages, images: [...selectedRoomForImages.images, newImg] });
    setNewImageUrl('');
    message.success('Thêm ảnh mới thành công!');
  };

  const handleDeleteImage = (imageId) => {
    const updatedImgs = selectedRoomForImages.images.filter(img => img.id !== imageId);
    setRooms(rooms.map(r => r.id === selectedRoomForImages.id ? { ...r, images: updatedImgs } : r));
    setSelectedRoomForImages({ ...selectedRoomForImages, images: updatedImgs });
    message.success('Đã xóa ảnh!');
  };

  const columns = [
    { title: 'Mã & Tiêu đề', dataIndex: 'title', key: 'title', render: (text, record) => <div><strong style={{ color: '#1677ff' }}>#{record.id}</strong> - {text}<div style={{ fontSize: '12px', color: '#8c8c8c' }}>📍 {record.addressDetail}, {record.district}</div></div> },
    { title: 'Giá thuê', dataIndex: 'price', key: 'price', render: (price) => <strong style={{ color: '#ff4d4f' }}>{Number(price).toLocaleString()} đ</strong> },
    { title: 'Diện tích', dataIndex: 'area', key: 'area', render: (area) => `${area} m²` },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status, record) => status === 'AVAILABLE' ? <Tag icon={<CheckCircleOutlined />} color="success">Sẵn sàng</Tag> : status === 'RENTED' ? <Tag color="processing">Đã cho thuê ({record.tenantName || 'Khách'})</Tag> : <Tag icon={<ToolOutlined />} color="warning">Bảo trì</Tag> },
    { title: 'Ảnh bài đăng', key: 'images', render: (_, record) => <Button type="dashed" size="small" icon={<PictureOutlined />} onClick={() => handleOpenImageModal(record)}>Quản lý ({record.images?.length || 0})</Button> },
    { title: 'Hành động', key: 'action', render: (_, record) => (
      <Space>
        <Button type="text" icon={<EditOutlined style={{ color: '#1677ff' }} />} onClick={() => handleOpenEditModal(record)}>Sửa</Button>
        <Popconfirm title="Xóa phòng này?" onConfirm={() => handleDeleteRoom(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
          <Button type="text" danger icon={<DeleteOutlined />}>Xóa</Button>
        </Popconfirm>
      </Space>
    )}
  ];

  return (
    <AntCard title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>🏢 Danh sách bài đăng & Quản lý phòng trọ</span>} extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAddModal} style={{ background: '#ff6b00', borderColor: '#ff6b00' }}>+ Thêm phòng mới</Button>} className="shadow-sm border-0" style={{ borderRadius: 16 }}>
      <Table columns={columns} dataSource={rooms} rowKey="id" pagination={{ pageSize: 5 }} />

      <Modal title={editingRoom ? `✏️ Chỉnh sửa phòng #${editingRoom.id}` : '➕ Đăng bài phòng trọ mới'} open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} destroyOnClose>
        <AntForm form={form} layout="vertical" onFinish={handleSubmitForm}>
          <AntForm.Item label="Tiêu đề" name="title" rules={[{ required: true }]}><Input /></AntForm.Item>
          <Row>
            <Col md={6}><AntForm.Item label="Quận / Huyện" name="district" rules={[{ required: true }]}><Input /></AntForm.Item></Col>
            <Col md={6}><AntForm.Item label="Địa chỉ chi tiết" name="addressDetail" rules={[{ required: true }]}><Input /></AntForm.Item></Col>
          </Row>
          <Row>
            <Col md={6}><AntForm.Item label="Giá (đ/tháng)" name="price" rules={[{ required: true, type: 'number', min: 1 }]}><InputNumber style={{ width: '100%' }} /></AntForm.Item></Col>
            <Col md={6}><AntForm.Item label="Diện tích (m²)" name="area" rules={[{ required: true, type: 'number', min: 1 }]}><InputNumber style={{ width: '100%' }} /></AntForm.Item></Col>
          </Row>
          {editingRoom && <AntForm.Item label="Trạng thái" name="status"><Select options={[{ value: 'AVAILABLE', label: '🟢 Sẵn sàng' }, { value: 'RENTED', label: '🔵 Đã cho thuê' }, { value: 'MAINTENANCE', label: '🟡 Bảo trì' }]} /></AntForm.Item>}
          {!editingRoom && <AntForm.Item label="URL Ảnh đầu tiên" name="firstImageUrl"><Input placeholder="Dán link ảnh..." /></AntForm.Item>}
          <AntForm.Item label="Mô tả" name="description"><Input.TextArea rows={2} /></AntForm.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Lưu lại</Button>
          </div>
        </AntForm>
      </Modal>

      <Modal title={`🖼️ Quản lý ảnh bài đăng - #${selectedRoomForImages?.id}`} open={isImageModalOpen} onCancel={() => setIsImageModalOpen(false)} footer={null}>
        <div style={{ marginBottom: 15, padding: 10, background: '#f5f5f5', borderRadius: 6 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <Input placeholder="Dán URL ảnh mới..." value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddImage}>Thêm ảnh</Button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {selectedRoomForImages?.images.map((img) => (
            <div key={img.id} style={{ position: 'relative' }}>
              <img src={img.url} alt="Room" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4 }} />
              <Popconfirm title="Xóa ảnh?" onConfirm={() => handleDeleteImage(img.id)} okText="Xóa">
                <Button shape="circle" danger size="small" icon={<DeleteOutlined />} style={{ position: 'absolute', top: 2, right: 2 }} />
              </Popconfirm>
            </div>
          ))}
        </div>
      </Modal>
    </AntCard>
  );
};

// ==========================================
// 3. COMPONENT DUYỆT YÊU CẦU (Dành cho Chủ nhà)
// ==========================================
const ApproveRequestsView = ({ requests, setRequests, onApprove }) => {
  const handleReject = (id) => {
    setRequests(requests.map(req => req.id === id ? { ...req, status: 'REJECTED' } : req));
    message.warning(`Đã từ chối yêu cầu #${id}.`);
  };

  const columns = [
    { title: 'Mã YC & Phòng', dataIndex: 'roomTitle', key: 'roomTitle', render: (text, record) => <div><strong style={{ color: '#1677ff' }}>{text}</strong><div style={{ fontSize: '12px', color: '#8c8c8c' }}>Phòng: #{record.roomId} | Mã YC: {record.id}</div></div> },
    { title: 'Khách thuê', dataIndex: 'tenantName', key: 'tenantName', render: (text, record) => <div><div><UserOutlined /> <strong>{text}</strong></div><small style={{ color: '#595959' }}>📞 {record.tenantPhone}</small></div> },
    { title: 'Thời hạn', key: 'duration', render: (_, record) => `${record.startDate} ➔ ${record.endDate}` },
    { title: 'Giá thuê', dataIndex: 'price', key: 'price', render: (price) => <strong style={{ color: '#ff4d4f' }}>{Number(price).toLocaleString()} đ/tháng</strong> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => status === 'PENDING' ? <Badge status="processing" text={<Tag color="gold">Chờ phê duyệt</Tag>} /> : status === 'APPROVED' ? <Tag color="green">Đã phê duyệt</Tag> : <Tag color="red">Đã từ chối</Tag> },
    { title: 'Hành động', key: 'action', render: (_, record) => record.status === 'PENDING' ? (
      <Space>
        <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => onApprove(record.id, record.roomId, record.tenantName)}>Duyệt</Button>
        <Popconfirm title="Từ chối yêu cầu này?" onConfirm={() => handleReject(record.id)} okText="Từ chối" cancelText="Hủy" okButtonProps={{ danger: true }}>
          <Button danger size="small" icon={<CloseOutlined />}>Từ chối</Button>
        </Popconfirm>
      </Space>
    ) : <span style={{ color: '#8c8c8c', fontSize: '12px' }}>Đã xử lý</span> }
  ];

  return (
    <AntCard title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>📋 Danh sách yêu cầu thuê chờ phê duyệt</span>} className="shadow-sm border-0" style={{ borderRadius: 16 }}>
      <Table columns={columns} dataSource={requests} rowKey="id" pagination={{ pageSize: 5 }} />
    </AntCard>
  );
};

// ==========================================
// 4. MAIN COMPONENT: HOME
// ==========================================
const Home = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [activeNav, setActiveNav] = useState('home');
  const [collapsed, setCollapsed] = useState(false);

  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [favorites, setFavorites] = useState([]);

  // Filter State
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [hasAc, setHasAc] = useState(false);
  const [hasWm, setHasWm] = useState(false);

  // Modals User
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [selectedRoomForRent, setSelectedRoomForRent] = useState(null);

  const [profileForm] = AntForm.useForm();
  const [passwordForm] = AntForm.useForm();
  const [rentalForm] = AntForm.useForm();

  useEffect(() => {
    const savedProfile = localStorage.getItem('saved_user_profile');
    const localUser = localStorage.getItem('user');
    let userData = null;

    if (savedProfile) try { userData = JSON.parse(savedProfile); } catch (e) {}
    else if (localUser) try { userData = JSON.parse(localUser); } catch (e) {}

    if (userData) {
      if (!userData.role) userData.role = 'LANDLORD';
      setUser(userData);
    } else {
      setUser({ username: 'Admin', role: 'LANDLORD' });
    }

    const savedFavs = localStorage.getItem('favorite_rooms');
    if (savedFavs) try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
  }, []);

  const isLandlord = user?.role === 'LANDLORD';

  // HÀM TỰ ĐỘNG ĐỒNG BỘ KHI CHỦ NHÀ DUYỆT YÊU CẦU THUÊ
  const handleApproveRequest = (requestId, roomId, tenantName) => {
    // 1. Cập nhật trạng thái Yêu cầu -> APPROVED
    const updatedRequests = requests.map(req => {
      if (req.id === requestId) return { ...req, status: 'APPROVED' };
      if (req.roomId === roomId && req.status === 'PENDING') return { ...req, status: 'REJECTED' };
      return req;
    });
    setRequests(updatedRequests);

    // 2. Tự động cập nhật Trạng thái Phòng -> RENTED + Gán Tên Khách thuê
    const updatedRooms = rooms.map(room => {
      if (room.id === roomId) {
        return { ...room, status: 'RENTED', tenantName: tenantName };
      }
      return room;
    });
    setRooms(updatedRooms);

    message.success(`Đã phê duyệt! Phòng #${roomId} đã cập nhật sang "Đã cho thuê" & Hợp đồng tự động tạo.`);
  };

  const toggleFavorite = (roomId) => {
    let updatedFavs;
    if (favorites.includes(roomId)) {
      updatedFavs = favorites.filter((id) => id !== roomId);
      message.info('Đã bỏ lưu phòng!');
    } else {
      updatedFavs = [...favorites, roomId];
      message.success('Đã lưu phòng!');
    }
    setFavorites(updatedFavs);
    localStorage.setItem('favorite_rooms', JSON.stringify(updatedFavs));
  };

  const handleSwitchMode = () => {
    const newRole = isLandlord ? 'TENANT' : 'LANDLORD';
    const updatedUser = { ...user, role: newRole };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    localStorage.setItem('saved_user_profile', JSON.stringify(updatedUser));
    setActiveNav('home');
    message.success(`Đã chuyển sang vai trò: ${newRole === 'LANDLORD' ? 'Chủ nhà' : 'Người thuê'}!`);
  };

  const handleOpenProfileModal = () => {
    profileForm.setFieldsValue({
      fullName: user?.fullName || user?.username || '',
      phone: user?.phone || '0987654321',
      email: user?.email || 'user@domain.vn',
      avatar: user?.avatar || ''
    });
    setIsProfileModalOpen(true);
  };

  const handleUpdateProfile = (values) => {
    const updatedUser = { ...user, ...values };
    setUser(updatedUser);
    localStorage.setItem('saved_user_profile', JSON.stringify(updatedUser));
    localStorage.setItem('user', JSON.stringify(updatedUser));
    message.success('Cập nhật thông tin thành công!');
    setIsProfileModalOpen(false);
  };

  const handleOpenPasswordModal = () => {
    passwordForm.resetFields();
    setIsPasswordModalOpen(true);
  };

  const handleChangePassword = (values) => {
    if (values.oldPassword !== '123456') {
      message.error('Mật khẩu cũ không đúng! (Mặc định: 123456)');
      return;
    }
    message.success('Đổi mật khẩu thành công!');
    passwordForm.resetFields();
    setIsPasswordModalOpen(false);
  };

  const handleOpenRentModal = (room) => {
    setSelectedRoomForRent(room);
    rentalForm.resetFields();
    setIsRentalModalOpen(true);
  };

  const handleSendRentRequest = (values) => {
    const newReq = {
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      roomId: selectedRoomForRent.id,
      roomTitle: selectedRoomForRent.title,
      tenantName: values.tenantName,
      tenantPhone: values.tenantPhone,
      startDate: values.startDate,
      endDate: values.endDate,
      price: selectedRoomForRent.price,
      status: 'PENDING'
    };
    setRequests([newReq, ...requests]);
    message.success('Đã gửi yêu cầu thuê phòng thành công! Quản lý sẽ phê duyệt sớm.');
    setIsRentalModalOpen(false);
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchTitle = searchKeyword ? removeVietnameseTones(room.title).includes(removeVietnameseTones(searchKeyword)) : true;
      const matchDistrict = selectedLocation ? removeVietnameseTones(room.district).includes(removeVietnameseTones(selectedLocation)) : true;
      const matchPrice = Number(room.price) <= Number(maxPrice);
      const matchAc = hasAc ? Boolean(room.hasAc) === true : true;
      const matchWm = hasWm ? Boolean(room.hasWm) === true : true;
      return matchTitle && matchDistrict && matchPrice && matchAc && matchWm;
    });
  }, [rooms, searchKeyword, selectedLocation, maxPrice, hasAc, hasWm]);

  const favoriteRoomsList = useMemo(() => {
    return rooms.filter(room => favorites.includes(room.id));
  }, [rooms, favorites]);

  // TỰ ĐỘNG TÍNH CÁC PHÒNG ĐÃ THUÊ CỦA NGƯỜI THUÊ TỪ YÊU CẦU ĐÃ DUYỆT (APPROVED)
  const approvedRequests = useMemo(() => {
    return requests.filter(req => req.status === 'APPROVED');
  }, [requests]);

  const approvedRoomsList = useMemo(() => {
    const approvedRoomIds = approvedRequests.map(r => r.roomId);
    return rooms.filter(room => approvedRoomIds.includes(room.id));
  }, [rooms, approvedRequests]);

  const settingsMenuItems = [
    { key: 'profile', icon: <EditOutlined />, label: 'Cập nhật thông tin', onClick: handleOpenProfileModal },
    { key: 'switch-mode', icon: <SwapOutlined style={{ color: '#1677ff' }} />, label: <span>Chuyển sang: <strong style={{ color: '#1677ff' }}>{isLandlord ? 'Người thuê' : 'Chủ nhà'}</strong></span>, onClick: handleSwitchMode },
    { key: 'password', icon: <LockOutlined />, label: 'Đổi mật khẩu', onClick: handleOpenPasswordModal },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true, onClick: onLogout }
  ];

  const displayName = user?.fullName || user?.username || 'Admin';

  const totalRoomsCount = rooms.length;
  const rentedRoomsCount = rooms.filter(r => r.status === 'RENTED').length;
  const availableRoomsCount = rooms.filter(r => r.status === 'AVAILABLE').length;
  const maintenanceRoomsCount = rooms.filter(r => r.status === 'MAINTENANCE').length;

  const revenueData = [
    { month: 'T1', val: '72tr', height: '65%' },
    { month: 'T2', val: '68tr', height: '60%' },
    { month: 'T3', val: '75tr', height: '70%' },
    { month: 'T4', val: '80tr', height: '78%' },
    { month: 'T5', val: '85tr', height: '85%' },
    { month: 'T6', val: '88tr', height: '90%' },
    { month: 'T7', val: '91tr', height: '98%' },
  ];

  return (
    <div className={`layout-wrapper ${collapsed ? 'sidebar-collapsed' : ''}`} style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      {/* SIDEBAR BÊN TRÁI */}
      <aside className="sidebar">
        <div className="sidebar-header">
          {!collapsed && <h5 style={{ color: '#fff', margin: 0, fontWeight: 'bold', fontSize: '16px' }}>{isLandlord ? 'LANDLORD DASHBOARD' : 'ROOM RENT'}</h5>}
          <Button type="text" icon={collapsed ? <MenuUnfoldOutlined style={{ color: '#fff', fontSize: '18px' }} /> : <MenuFoldOutlined style={{ color: '#fff', fontSize: '18px' }} />} onClick={() => setCollapsed(!collapsed)} />
        </div>

        <div className="sidebar-user-box">
          <Avatar src={user?.avatar} icon={<UserOutlined />} style={{ backgroundColor: '#ff6b00', flexShrink: 0 }} />
          {!collapsed && <div className="sidebar-user-info"><span className="greeting">Xin chào,</span><span className="username">{displayName}</span></div>}
        </div>

        <nav className="sidebar-menu">
          {!isLandlord ? (
            <>
              <div className={`menu-item ${activeNav === 'home' ? 'active' : ''}`} onClick={() => setActiveNav('home')} title="Trang chủ"><HomeOutlined className="menu-icon" /> {!collapsed && <span>Trang chủ</span>}</div>
              <div className={`menu-item ${activeNav === 'my-rent' ? 'active' : ''}`} onClick={() => setActiveNav('my-rent')} title="Phòng đã thuê"><KeyOutlined className="menu-icon" /> {!collapsed && <span>Phòng đã thuê ({approvedRoomsList.length})</span>}</div>
              <div className={`menu-item ${activeNav === 'contracts' ? 'active' : ''}`} onClick={() => setActiveNav('contracts')} title="Hợp đồng"><FileTextOutlined className="menu-icon" /> {!collapsed && <span>Hợp đồng ({approvedRequests.length})</span>}</div>
              <div className={`menu-item ${activeNav === 'favorites' ? 'active' : ''}`} onClick={() => setActiveNav('favorites')} title="Yêu thích"><HeartOutlined className="menu-icon" /> {!collapsed && <span>Yêu thích ({favorites.length})</span>}</div>
            </>
          ) : (
            <>
              <div className={`menu-item ${activeNav === 'home' ? 'active' : ''}`} onClick={() => setActiveNav('home')} title="Trang chủ"><BarChartOutlined className="menu-icon" /> {!collapsed && <span>Trang chủ</span>}</div>
              <div className={`menu-item ${activeNav === 'my-rooms' ? 'active' : ''}`} onClick={() => setActiveNav('my-rooms')} title="Đăng bài & Phòng"><AppstoreOutlined className="menu-icon" /> {!collapsed && <span>Đăng bài & Phòng</span>}</div>
              <div className={`menu-item ${activeNav === 'approve' ? 'active' : ''}`} onClick={() => setActiveNav('approve')} title="Duyệt yêu cầu"><FileTextOutlined className="menu-icon" /> {!collapsed && <span>Duyệt yêu cầu ({requests.filter((r) => r.status === 'PENDING').length})</span>}</div>
            </>
          )}
        </nav>
      </aside>

      {/* NỘI DUNG CHÍNH BÊN PHẢI */}
      <main className="main-content">
        <header className="top-header" style={{ background: '#1a2238' }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Input prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />} placeholder="Tìm kiếm phòng trọ, khu vực..." style={{ width: 360, borderRadius: 20 }} value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Badge count={isLandlord ? requests.filter(r => r.status === 'PENDING').length : approvedRequests.length} size="small">
              <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: '18px', color: '#fff' }} />} />
            </Badge>

            <Dropdown menu={{ items: settingsMenuItems }} trigger={['click']} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#fff' }}>
                <Avatar src={user?.avatar} icon={<UserOutlined />} size="small" style={{ backgroundColor: '#ff6b00' }} />
                <span style={{ fontWeight: 500, fontSize: '14px', color: '#fff' }}>{displayName}</span>
                <DownOutlined style={{ fontSize: '10px', color: '#fff' }} />
              </div>
            </Dropdown>
          </div>
        </header>

        <div className="content-body" style={{ padding: '24px' }}>
          {/* ==================== TRANG CHỦ CHỦ NHÀ / ADMIN ==================== */}
          {isLandlord && activeNav === 'home' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontWeight: 700, color: '#1f2937', margin: 0, fontSize: 24 }}>
                    Chào buổi sáng, {displayName}! 👋
                  </h3>
                  <div style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
                    Đây là tổng quan hệ thống quản lý bất động sản của bạn
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Button icon={<ExportOutlined />} style={{ borderRadius: 8, height: 40, fontWeight: 500 }} onClick={() => message.success('Xuất báo cáo PDF thành công!')}>
                    Xuất báo cáo
                  </Button>
                  <Button type="primary" icon={<PlusOutlined />} style={{ background: '#ff6b00', borderColor: '#ff6b00', borderRadius: 8, height: 40, fontWeight: 600 }} onClick={() => setActiveNav('my-rooms')}>
                    + Thêm phòng
                  </Button>
                </div>
              </div>

              {/* HÀNG 6 THẺ THỐNG KÊ TỰ ĐỘNG */}
              <Row className="g-3 mb-4">
                <Col md={4} lg={2}>
                  <div style={{ background: '#fff', borderRadius: 16, padding: '16px', border: '1px solid #f0f0f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏠</div>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Tổng số phòng</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#1f2937' }}>{totalRoomsCount}</div>
                      </div>
                    </div>
                  </div>
                </Col>

                <Col md={4} lg={2}>
                  <div style={{ background: '#fff', borderRadius: 16, padding: '16px', border: '1px solid #f0f0f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: '#e6f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🔑</div>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Phòng đã thuê</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#1f2937' }}>{rentedRoomsCount}</div>
                      </div>
                    </div>
                  </div>
                </Col>

                <Col md={4} lg={2}>
                  <div style={{ background: '#fff', borderRadius: 16, padding: '16px', border: '1px solid #f0f0f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🟢</div>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Phòng trống</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#1f2937' }}>{availableRoomsCount}</div>
                      </div>
                    </div>
                  </div>
                </Col>

                <Col md={4} lg={2}>
                  <div style={{ background: '#fff', borderRadius: 16, padding: '16px', border: '1px solid #ffe8cc', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💰</div>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Doanh thu/tháng</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#1f2937' }}>91 tr</div>
                      </div>
                    </div>
                  </div>
                </Col>

                <Col md={4} lg={2}>
                  <div style={{ background: '#fff', borderRadius: 16, padding: '16px', border: '1px solid #f0f0f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📜</div>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Hợp đồng active</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#1f2937' }}>{rentedRoomsCount}</div>
                      </div>
                    </div>
                  </div>
                </Col>

                <Col md={4} lg={2}>
                  <div style={{ background: '#fff', borderRadius: 16, padding: '16px', border: '1px solid #f0f0f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🔧</div>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Đang bảo trì</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#1f2937' }}>{maintenanceRoomsCount}</div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* BIỂU ĐỒ DOANH THU & TỶ LỆ LẤP ĐẦY */}
              <Row className="g-3 mb-4">
                <Col md={8}>
                  <div style={{ background: '#fff', borderRadius: 16, padding: '20px', border: '1px solid #f0f0f0', height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <div>
                        <h6 style={{ fontWeight: 700, margin: 0, fontSize: 16, color: '#1f2937' }}>Doanh thu 7 tháng gần nhất</h6>
                        <small style={{ color: '#9ca3af' }}>Đơn vị: triệu VNĐ</small>
                      </div>
                      <Tag color="green" style={{ borderRadius: 12, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>↑ 12% so với T6</Tag>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 180, padding: '0 10px' }}>
                      {revenueData.map((item, index) => (
                        <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '11%' }}>
                          <div style={{ height: 140, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                            <div style={{
                              width: '100%',
                              height: item.height,
                              background: index === revenueData.length - 1 ? 'linear-gradient(180deg, #ff6b00 0%, #ff9800 100%)' : '#e5e7eb',
                              borderRadius: '6px 6px 0 0',
                              transition: 'all 0.3s'
                            }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#4b5563', marginTop: 8 }}>{item.month}</span>
                          <span style={{ fontSize: 10, color: '#9ca3af' }}>{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Col>

                <Col md={4}>
                  <div style={{ background: '#fff', borderRadius: 16, padding: '20px', border: '1px solid #f0f0f0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h6 style={{ fontWeight: 700, margin: 0, fontSize: 16, color: '#1f2937' }}>Tỷ lệ lấp đầy phòng</h6>
                      <small style={{ color: '#9ca3af' }}>Trạng thái hoạt động phòng trọ</small>
                    </div>
                    <div style={{ textAlign: 'center', margin: '20px 0' }}>
                      <Progress type="dashboard" percent={Math.round((rentedRoomsCount / (totalRoomsCount || 1)) * 100)} strokeColor="#ff6b00" size={140} />
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
                      Đã lấp đầy {rentedRoomsCount}/{totalRoomsCount} phòng trọ
                    </div>
                  </div>
                </Col>
              </Row>
            </>
          )}

          {/* ==================== TRANG CHỦ NGƯỜI THUÊ (TENANT) ==================== */}
          {!isLandlord && activeNav === 'home' && (
            <>
              {/* BỘ LỌC TÌM KIẾM */}
              <AntCard className="shadow-sm border-0 mb-4" style={{ borderRadius: 16 }}>
                <Row className="g-3 align-items-center">
                  <Col md={3}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#4b5563', marginBottom: 4, display: 'block' }}>Khu vực / Quận</label>
                    <Select style={{ width: '100%' }} placeholder="Tất cả quận/huyện" allowClear onChange={(v) => setSelectedLocation(v || '')}>
                      <Select.Option value="Cầu Giấy">Cầu Giấy</Select.Option>
                      <Select.Option value="Nam Từ Liêm">Nam Từ Liêm</Select.Option>
                      <Select.Option value="Tây Hồ">Tây Hồ</Select.Option>
                      <Select.Option value="Thanh Xuân">Thanh Xuân</Select.Option>
                      <Select.Option value="Đống Đa">Đống Đa</Select.Option>
                      <Select.Option value="Hoàng Mai">Hoàng Mai</Select.Option>
                    </Select>
                  </Col>
                  <Col md={4}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#4b5563', marginBottom: 4, display: 'block' }}>
                      Mức giá tối đa: <strong style={{ color: '#ff4d4f' }}>{Number(maxPrice).toLocaleString()} đ</strong>
                    </label>
                    <Slider min={1000000} max={10000000} step={500000} value={maxPrice} onChange={(v) => setMaxPrice(v)} />
                  </Col>
                  <Col md={2}>
                    <Space direction="vertical">
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#4b5563' }}>Tiện ích</label>
                      <Switch checkedChildren="Điều hòa" unCheckedChildren="Điều hòa" checked={hasAc} onChange={(v) => setHasAc(v)} />
                    </Space>
                  </Col>
                  <Col md={2}>
                    <Space direction="vertical">
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#4b5563' }}>Tiện ích</label>
                      <Switch checkedChildren="Máy giặt" unCheckedChildren="Máy giặt" checked={hasWm} onChange={(v) => setHasWm(v)} />
                    </Space>
                  </Col>
                  <Col md={1} style={{ textAlign: 'right' }}>
                    <Button type="primary" danger style={{ borderRadius: 8 }} onClick={() => { setSearchKeyword(''); setSelectedLocation(''); setMaxPrice(10000000); setHasAc(false); setHasWm(false); }}>
                      Xóa lọc
                    </Button>
                  </Col>
                </Row>
              </AntCard>

              {/* DANH SÁCH BÀI ĐĂNG PHÒNG */}
              <h5 style={{ fontWeight: 700, marginBottom: 16, color: '#1f2937' }}>Phòng trọ dành cho bạn ({filteredRooms.length})</h5>
              <Row className="g-4">
                {filteredRooms.map((room) => {
                  const isFav = favorites.includes(room.id);
                  const isAvailable = room.status === 'AVAILABLE';
                  return (
                    <Col md={6} lg={4} key={room.id}>
                      <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16, overflow: 'hidden', background: '#fff' }}>
                        <div style={{ position: 'relative' }}>
                          <img src={room.images[0]?.url} alt="" style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                          <Button
                            shape="circle"
                            type="text"
                            icon={isFav ? <HeartFilled style={{ color: '#ff4d4f', fontSize: 18 }} /> : <HeartOutlined style={{ color: '#fff', fontSize: 18 }} />}
                            onClick={() => toggleFavorite(room.id)}
                            style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.4)' }}
                          />
                          <Tag color={isAvailable ? 'green' : room.status === 'RENTED' ? 'red' : 'gold'} style={{ position: 'absolute', bottom: 10, left: 10, borderRadius: 10 }}>
                            {isAvailable ? 'Sẵn sàng' : room.status === 'RENTED' ? 'Đã cho thuê' : 'Bảo trì'}
                          </Tag>
                        </div>
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px' }}>
                          <div>
                            <h6 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{room.title}</h6>
                            <p style={{ fontSize: 12, color: '#6b7280', margin: '6px 0' }}>
                              <EnvironmentOutlined /> {room.addressDetail}, {room.district}
                            </p>
                            <div style={{ display: 'flex', gap: 6, margin: '8px 0' }}>
                              {room.hasAc && <Tag color="blue">Điều hòa</Tag>}
                              {room.hasWm && <Tag color="cyan">Máy giặt</Tag>}
                              <Tag color="purple">{room.area} m²</Tag>
                            </div>
                            <p style={{ fontSize: 12, color: '#4b5563', margin: 0 }}>{room.description}</p>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#ff4d4f' }}>
                              {Number(room.price).toLocaleString()} đ<small style={{ fontSize: 11, color: '#8c8c8c' }}>/tháng</small>
                            </div>
                            <Button
                              type="primary"
                              disabled={!isAvailable}
                              style={{ background: isAvailable ? '#ff6b00' : '#d9d9d9', borderColor: isAvailable ? '#ff6b00' : '#d9d9d9', borderRadius: 8 }}
                              onClick={() => handleOpenRentModal(room)}
                            >
                              {isAvailable ? 'Gửi yêu cầu thuê' : 'Đã có người thuê'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </>
          )}

          {/* ==================== CÁC VIEW DÀNH CHO QUẢN LÝ / NGƯỜI THUÊ ==================== */}
          {isLandlord && activeNav === 'my-rooms' && <MyRoomsView rooms={rooms} setRooms={setRooms} />}
          {isLandlord && activeNav === 'approve' && <ApproveRequestsView requests={requests} setRequests={setRequests} onApprove={handleApproveRequest} />}

          {/* PHẦN PHÒNG ĐÃ THUÊ CỦA KHÁCH THUÊ (TỰ ĐỘNG CẬP NHẬT KHI ĐƯỢC DUYỆT) */}
          {!isLandlord && activeNav === 'my-rent' && (
            <AntCard title="🔑 Danh sách phòng bạn đã thuê" className="shadow-sm border-0" style={{ borderRadius: 16 }}>
              {approvedRoomsList.length === 0 ? (
                <Empty description="Bạn chưa có phòng nào được phê duyệt cho thuê." />
              ) : (
                <Row className="g-3">
                  {approvedRoomsList.map(room => (
                    <Col md={6} key={room.id}>
                      <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
                        <img src={room.images[0]?.url} alt="" style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                        <div style={{ padding: 16 }}>
                          <h6 style={{ fontWeight: 700 }}>{room.title}</h6>
                          <p style={{ fontSize: 12, color: '#6b7280' }}>📍 {room.addressDetail}, {room.district}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ color: '#ff4d4f' }}>{Number(room.price).toLocaleString()} đ/tháng</strong>
                            <Tag color="green">Đang hiệu lực</Tag>
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              )}
            </AntCard>
          )}

          {/* PHẦN HỢP ĐỒNG CỦA KHÁCH THUÊ (TỰ ĐỘNG TẠO HỢP ĐỒNG KHI ĐƯỢC DUYỆT) */}
          {!isLandlord && activeNav === 'contracts' && (
            <AntCard title="📜 Hợp đồng thuê phòng của tôi" className="shadow-sm border-0" style={{ borderRadius: 16 }}>
              {approvedRequests.length === 0 ? (
                <Empty description="Chưa có hợp đồng nào được khởi tạo." />
              ) : (
                <Table
                  dataSource={approvedRequests}
                  columns={[
                    { title: 'Mã hợp đồng', dataIndex: 'id', render: (id) => <strong style={{ color: '#1677ff' }}>HD-{id}</strong> },
                    { title: 'Tên phòng', dataIndex: 'roomTitle' },
                    { title: 'Mã phòng', dataIndex: 'roomId', render: (id) => `#${id}` },
                    { title: 'Ngày bắt đầu', dataIndex: 'startDate' },
                    { title: 'Ngày kết thúc', dataIndex: 'endDate' },
                    { title: 'Giá thuê', dataIndex: 'price', render: (p) => <strong style={{ color: '#ff4d4f' }}>{Number(p).toLocaleString()} đ</strong> },
                    { title: 'Trạng thái', key: 'status', render: () => <Tag color="green">Còn hiệu lực</Tag> }
                  ]}
                  rowKey="id"
                />
              )}
            </AntCard>
          )}

          {!isLandlord && activeNav === 'favorites' && (
            <AntCard title="❤️ Danh sách phòng trọ đã lưu" className="shadow-sm border-0" style={{ borderRadius: 16 }}>
              <Row className="g-3">
                {favoriteRoomsList.length === 0 ? <p>Chưa có phòng nào trong danh sách yêu thích.</p> : favoriteRoomsList.map(room => (
                  <Col md={6} key={room.id}>
                    <div style={{ display: 'flex', gap: 12, padding: 10, border: '1px solid #f0f0f0', borderRadius: 8 }}>
                      <img src={room.images[0]?.url} alt="" style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 6 }} />
                      <div style={{ flex: 1 }}>
                        <h6>{room.title}</h6>
                        <strong style={{ color: '#ff4d4f' }}>{Number(room.price).toLocaleString()} đ</strong>
                        <div style={{ marginTop: 6 }}>
                          <Button danger size="small" icon={<DeleteOutlined />} onClick={() => toggleFavorite(room.id)}>Bỏ lưu</Button>
                        </div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </AntCard>
          )}
        </div>
      </main>

      {/* MODAL GỬI YÊU CẦU THUÊ PHÒNG */}
      <Modal title={`📄 Gửi yêu cầu thuê phòng - #${selectedRoomForRent?.id}`} open={isRentalModalOpen} onCancel={() => setIsRentalModalOpen(false)} footer={null}>
        <AntForm form={rentalForm} layout="vertical" onFinish={handleSendRentRequest} initialValues={{ tenantName: user?.fullName || displayName, tenantPhone: '0987654321', startDate: '2026-08-01', endDate: '2027-08-01' }}>
          <AntForm.Item label="Họ và tên người thuê" name="tenantName" rules={[{ required: true }]}><Input /></AntForm.Item>
          <AntForm.Item label="Số điện thoại liên hệ" name="tenantPhone" rules={[{ required: true }]}><Input /></AntForm.Item>
          <Row>
            <Col md={6}><AntForm.Item label="Ngày bắt đầu" name="startDate" rules={[{ required: true }]}><Input type="date" /></AntForm.Item></Col>
            <Col md={6}><AntForm.Item label="Ngày kết thúc dự kiến" name="endDate" rules={[{ required: true }]}><Input type="date" /></AntForm.Item></Col>
          </Row>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button onClick={() => setIsRentalModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" style={{ background: '#ff6b00', borderColor: '#ff6b00' }}>Gửi yêu cầu ngay</Button>
          </div>
        </AntForm>
      </Modal>

      {/* MODAL CẬP NHẬT PROFILE */}
      <Modal title="👤 Cập nhật thông tin cá nhân" open={isProfileModalOpen} onCancel={() => setIsProfileModalOpen(false)} footer={null}>
        <AntForm form={profileForm} layout="vertical" onFinish={handleUpdateProfile}>
          <AntForm.Item label="Họ và tên" name="fullName" rules={[{ required: true }]}><Input /></AntForm.Item>
          <AntForm.Item label="Số điện thoại" name="phone"><Input /></AntForm.Item>
          <AntForm.Item label="Email" name="email"><Input /></AntForm.Item>
          <AntForm.Item label="Link Avatar" name="avatar"><Input /></AntForm.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button onClick={() => setIsProfileModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Lưu lại</Button>
          </div>
        </AntForm>
      </Modal>

      {/* MODAL ĐỔI MẬT KHẨU */}
      <Modal title="🔒 Đổi mật khẩu" open={isPasswordModalOpen} onCancel={() => setIsPasswordModalOpen(false)} footer={null}>
        <AntForm form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
          <AntForm.Item label="Mật khẩu cũ" name="oldPassword" rules={[{ required: true }]}><Input.Password placeholder="Mặc định: 123456" /></AntForm.Item>
          <AntForm.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, min: 6 }]}><Input.Password /></AntForm.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button onClick={() => setIsPasswordModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Đổi mật khẩu</Button>
          </div>
        </AntForm>
      </Modal>
    </div>
  );
};

export default Home;