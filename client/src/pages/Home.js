import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col } from 'react-bootstrap';
import {
  Modal, Button, Dropdown, message, Input, Badge, Form as AntForm, Avatar,
  Table, Tag, Space, Popconfirm, Card as AntCard, InputNumber, Select, Progress, Slider, Empty, Spin, Popover, List
} from 'antd';
import {
  HomeOutlined, AppstoreOutlined, FileTextOutlined, UserOutlined, SearchOutlined,
  LockOutlined, EditOutlined, LogoutOutlined,
  SwapOutlined, HeartOutlined, HeartFilled, DeleteOutlined,
  BarChartOutlined, DownOutlined, BellOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  PlusOutlined, PictureOutlined, ToolOutlined, CheckCircleOutlined, CheckOutlined, CloseOutlined,
  ExportOutlined, KeyOutlined, PhoneOutlined, InfoCircleOutlined, EyeOutlined, PieChartOutlined,
  DollarOutlined, RiseOutlined, ExclamationCircleOutlined, SyncOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { roomApi } from '../api/roomApi';
import './Home.css';
import axios from 'axios';


// Dữ liệu mẫu khởi tạo dự phòng khi chưa kết nối DB
const INITIAL_ROOMS = [
  {
    id: 'P101',
    title: 'P101 — Nam Từ Liêm',
    addressDetail: '123 Lê Đức Thọ, Nam Từ Liêm, Hà Nội',
    district: 'Nam Từ Liêm',
    roomType: 'Studio',
    price: 4500000,
    area: 28,
    rating: 4.7,
    reviewCount: 23,
    hasAc: true,
    hasWm: true,
    status: 'RENTED',
    tenantName: 'Trần Thị Hương',
    landlordName: 'Nguyễn Minh Tuấn',
    landlordPhone: '0901234567',
    description: 'Phòng studio đầy đủ đồ, ban công thoáng mát, an ninh 24/7.',
    images: [{ id: 1, url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=80' }]
  },
  {
    id: 'P202',
    title: 'P202 — Cầu Giấy',
    addressDetail: 'Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    roomType: '1 phòng ngủ',
    price: 5200000,
    area: 35,
    rating: 4.5,
    reviewCount: 18,
    hasAc: true,
    hasWm: false,
    status: 'AVAILABLE',
    tenantName: '',
    landlordName: 'Nguyễn Minh Tuấn',
    landlordPhone: '0901234567',
    description: 'Cạnh các trường đại học lớn, giờ giấc tự do, không chung chủ.',
    images: [{ id: 2, url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=500&q=80' }]
  },
  {
    id: 'P301',
    title: 'P301 — Thanh Xuân',
    addressDetail: 'Thanh Xuân, Hà Nội',
    district: 'Thanh Xuân',
    roomType: 'Khép kín',
    price: 3200000,
    area: 18,
    rating: 4.2,
    reviewCount: 31,
    hasAc: true,
    hasWm: true,
    status: 'AVAILABLE',
    tenantName: '',
    landlordName: 'Nguyễn Minh Tuấn',
    landlordPhone: '0901234567',
    description: 'Phòng riêng khép kín sinh viên, giá hợp lý, ngay trung tâm.',
    images: [{ id: 3, url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=500&q=80' }]
  }
];

const INITIAL_REQUESTS = [
  { id: 'REQ-101', roomId: 'P101', roomTitle: 'P101 — Studio Lê Đức Thọ', tenantName: 'Trần Thị Hương', tenantPhone: '0987654321', startDate: '2026-01-01', endDate: '2027-01-01', price: 4500000, status: 'APPROVED' },
  { id: 'REQ-102', roomId: 'P305', roomTitle: 'Căn hộ Mini 1PN', tenantName: 'Trần Thị Hương', tenantPhone: '0987654321', startDate: '2025-12-10', endDate: '2026-12-10', price: 3900000, status: 'REJECTED' },
  { id: 'REQ-103', roomId: 'P202', roomTitle: 'Phòng Khép Kín P202', tenantName: 'Trần Thị Hương', tenantPhone: '0987654321', startDate: '2026-06-01', endDate: '2027-06-01', price: 5200000, status: 'PENDING' }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-1',
    title: 'Yêu cầu thuê mới',
    content: 'Khách hàng Trần Văn Nam vừa gửi yêu cầu thuê phòng #P102.',
    time: '10 phút trước',
    isRead: false,
    type: 'REQUEST'
  },
  {
    id: 'NOTIF-2',
    title: 'Thanh toán thành công',
    content: 'Hệ thống đã nhận thanh toán tiền thuê phòng tháng này của phòng #P101.',
    time: '2 giờ trước',
    isRead: true,
    type: 'SYSTEM'
  }
];

const INITIAL_MAINTENANCE_REPORTS = [
  { id: 'MR-01', roomId: 'P101', title: 'Điều hòa không mát', category: 'Điện lạnh', date: '10/06/2026', resolvedDate: '12/06/2026', status: 'done', reporter: 'Trần Thị Hương', phone: '0987654321', desc: 'Máy phát ra tiếng ồn nhẹ và rò rỉ nước ở cục lạnh.' },
  { id: 'MR-02', roomId: 'P101', title: 'Vòi nước bị rỉ', category: 'Nước', date: '18/07/2026', resolvedDate: null, status: 'processing', reporter: 'Trần Thị Hương', phone: '0987654321', desc: 'Vòi rỉ nước liên tục ở nhà vệ sinh.' },
];

const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
};

const Stars = ({ rating }) => {
  const rounded = Math.round(rating || 5);
  return (
    <span style={{ color: '#fadb14', fontSize: '12px' }}>
      {'★'.repeat(rounded)}
      <span style={{ color: '#d9d9d9' }}>{'★'.repeat(5 - rounded)}</span>
    </span>
  );
};

// =========================================================================
// COMPONENT: QUẢN LÝ BẢO TRÌ & SỰ CỐ (DÀNH CHO CHỦ NHÀ) - MỤC MỚI BỔ SUNG
// =========================================================================
const MaintenanceManagementView = ({ mrList, setMrList, rooms, setRooms, addNotification }) => {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMR, setSelectedMR] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [form] = AntForm.useForm();

  // Đổi trạng thái sự cố
  const handleUpdateStatus = (mrId, newStatus) => {
    const updated = mrList.map(item => {
      if (item.id === mrId) {
        const isDone = newStatus === 'done';
        return {
          ...item,
          status: newStatus,
          resolvedDate: isDone ? new Date().toLocaleDateString('vi-VN') : null
        };
      }
      return item;
    });
    setMrList(updated);

    const target = mrList.find(i => i.id === mrId);
    const statusText = newStatus === 'done' ? 'Đã hoàn thành' : newStatus === 'processing' ? 'Đang sửa chữa' : 'Chờ xử lý';
    
    message.success(`Đã cập nhật trạng thái sự cố #${mrId} sang: ${statusText}`);
    
    if (addNotification && target) {
      addNotification(
        'Cập nhật tiến độ bảo trì',
        `Sự cố "${target.title}" phòng #${target.roomId} đã chuyển sang trạng thái: ${statusText}.`,
        newStatus === 'done' ? 'SUCCESS' : 'SYSTEM'
      );
    }
  };

  // Xóa / Đóng báo cáo bảo trì
  const handleDeleteMR = (mrId) => {
    setMrList(mrList.filter(item => item.id !== mrId));
    message.success(`Đã xóa báo cáo sự cố #${mrId}!`);
  };

  // Thêm mới sự cố trực tiếp từ phía Chủ nhà
  const handleCreateMaintenance = (values) => {
    const newMR = {
      id: `MR-0${mrList.length + 1}`,
      roomId: values.roomId,
      title: values.title,
      category: values.category,
      date: new Date().toLocaleDateString('vi-VN'),
      resolvedDate: null,
      status: values.status || 'pending',
      reporter: 'Chủ nhà (Tự ghi nhận)',
      phone: '0901234567',
      desc: values.desc || 'Kiểm tra bảo trì định kỳ / phát sinh.'
    };

    setMrList([newMR, ...mrList]);
    
    // Nếu chọn trạng thái là "Đang sửa", có thể chuyển trạng thái phòng sang MAINTENANCE nếu muốn
    if (values.updateRoomStatus) {
      setRooms(rooms.map(r => r.id === values.roomId ? { ...r, status: 'MAINTENANCE' } : r));
    }

    message.success('Đã tạo lượt bảo trì mới thành công!');
    setIsAddModalOpen(false);
    form.resetFields();
  };

  // Lọc dữ liệu
  const filteredMRList = useMemo(() => {
    return mrList.filter(item => {
      const matchStatus = filterStatus === 'ALL' ? true : item.status === filterStatus;
      const matchCat = filterCategory === 'ALL' ? true : item.category === filterCategory;
      return matchStatus && matchCat;
    });
  }, [mrList, filterStatus, filterCategory]);

  const pendingCount = mrList.filter(i => i.status === 'pending').length;
  const processingCount = mrList.filter(i => i.status === 'processing').length;
  const doneCount = mrList.filter(i => i.status === 'done').length;

  const columns = [
    {
      title: 'Mã & Phòng',
      dataIndex: 'id',
      key: 'id',
      render: (id, record) => (
        <div>
          <strong style={{ color: '#1677ff' }}>#{id}</strong> — <Tag color="blue">Phòng #{record.roomId}</Tag>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.date}</div>
        </div>
      )
    },
    {
      title: 'Tiêu đề sự cố & Danh mục',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <strong style={{ color: '#111827' }}>{text}</strong>
          <div><Tag style={{ fontSize: '11px', marginTop: 2 }}>{record.category}</Tag></div>
        </div>
      )
    },
    {
      title: 'Người báo cáo',
      dataIndex: 'reporter',
      key: 'reporter',
      render: (text, record) => (
        <div style={{ fontSize: '13px' }}>
          <div>👤 {text || 'Khách thuê'}</div>
          <small style={{ color: '#6b7280' }}>📞 {record.phone || '0987654321'}</small>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (st) => {
        if (st === 'pending') return <Tag icon={<ClockCircleOutlined />} color="orange">Chờ xử lý</Tag>;
        if (st === 'processing') return <Tag icon={<SyncOutlined spin />} color="processing">Đang sửa chữa</Tag>;
        return <Tag icon={<CheckCircleOutlined />} color="success">Hoàn thành</Tag>;
      }
    },
    {
      title: 'Cập nhật nhanh',
      key: 'updateStatus',
      render: (_, record) => (
        <Select
          size="small"
          value={record.status}
          style={{ width: 130 }}
          onChange={(val) => handleUpdateStatus(record.id, val)}
          options={[
            { value: 'pending', label: '🟠 Chờ xử lý' },
            { value: 'processing', label: '🔵 Đang sửa' },
            { value: 'done', label: '🟢 Hoàn thành' }
          ]}
        />
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined style={{ color: '#1677ff' }} />}
            onClick={() => { setSelectedMR(record); setIsDetailModalOpen(true); }}
          >
            Chi tiết
          </Button>
          <Popconfirm title="Xóa yêu cầu bảo trì này?" onConfirm={() => handleDeleteMR(record.id)} okText="Xóa" cancelText="Hủy">
            <Button type="text" danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h4 style={{ fontWeight: 800, color: '#111827', margin: 0 }}>
            🛠️ Quản lý Bảo trì & Sửa chữa Sự cố
          </h4>
          <span style={{ color: '#6b7280', fontSize: 13 }}>
            Theo dõi và điều phối khắc phục các hỏng hóc thiết bị trong toàn hệ thống phòng trọ
          </span>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: '#ff6b00', borderColor: '#ff6b00', borderRadius: 8, fontWeight: 600 }}
          onClick={() => setIsAddModalOpen(true)}
        >
          + Tạo sự cố bảo trì mới
        </Button>
      </div>

      {/* THỐNG KÊ SỰ CỐ BẢO TRÌ */}
      <Row className="g-3 mb-4">
        <Col sm={4} xs={12}>
          <AntCard className="shadow-sm border-0" style={{ borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fffbe6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#faad14' }}>
                <ClockCircleOutlined />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>CẦN XỬ LÝ GẤP</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#faad14' }}>{pendingCount} sự cố</div>
              </div>
            </div>
          </AntCard>
        </Col>

        <Col sm={4} xs={12}>
          <AntCard className="shadow-sm border-0" style={{ borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#e6f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#1677ff' }}>
                <SyncOutlined spin={processingCount > 0} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>ĐANG SỬA CHỮA</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#1677ff' }}>{processingCount} sự cố</div>
              </div>
            </div>
          </AntCard>
        </Col>

        <Col sm={4} xs={12}>
          <AntCard className="shadow-sm border-0" style={{ borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f6ffed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#52c41a' }}>
                <CheckCircleOutlined />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>ĐÃ HOÀN THÀNH</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#52c41a' }}>{doneCount} sự cố</div>
              </div>
            </div>
          </AntCard>
        </Col>
      </Row>

      {/* BẢNG BẢO TRÌ & LỌC */}
      <AntCard
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>📋 Danh sách phiếu yêu cầu sửa chữa</span>
            <Space flexWrap="wrap">
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 140 }}
                options={[
                  { value: 'ALL', label: 'Tất cả trạng thái' },
                  { value: 'pending', label: 'Chờ xử lý' },
                  { value: 'processing', label: 'Đang sửa' },
                  { value: 'done', label: 'Hoàn thành' }
                ]}
              />
              <Select
                value={filterCategory}
                onChange={setFilterCategory}
                style={{ width: 140 }}
                options={[
                  { value: 'ALL', label: 'Tất cả danh mục' },
                  { value: 'Điện lạnh', label: 'Điện lạnh' },
                  { value: 'Nước', label: 'Điện nước' },
                  { value: 'Thiết bị', label: 'Thiết bị điện' },
                  { value: 'Nội thất', label: 'Nội thất' },
                  { value: 'Khác', label: 'Khác' }
                ]}
              />
            </Space>
          </div>
        }
        className="shadow-sm border-0"
        style={{ borderRadius: 16 }}
      >
        <Table
          dataSource={filteredMRList}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 6 }}
          scroll={{ x: 'max-content' }}
        />
      </AntCard>

      {/* MODAL TẠO BẢO TRÌ MỚI */}
      <Modal
        title="➕ Thêm lượt bảo trì / Báo sự cố"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <AntForm form={form} layout="vertical" onFinish={handleCreateMaintenance}>
          <AntForm.Item label="Chọn phòng trọ" name="roomId" rules={[{ required: true, message: 'Chọn phòng!' }]}>
            <Select placeholder="Chọn phòng phát sinh sự cố">
              {rooms.map(r => (
                <Select.Option key={r.id} value={r.id}>
                  #{r.id} — {r.title}
                </Select.Option>
              ))}
            </Select>
          </AntForm.Item>

          <AntForm.Item label="Danh mục sự cố" name="category" rules={[{ required: true }]}>
            <Select placeholder="Chọn loại thiết bị">
              <Select.Option value="Điện lạnh">❄️ Điện lạnh (Điều hòa, Tủ lạnh)</Select.Option>
              <Select.Option value="Nước">🚰 Điện nước (Vòi, đường ống)</Select.Option>
              <Select.Option value="Thiết bị">💡 Thiết bị điện (Đèn, ổ cắm)</Select.Option>
              <Select.Option value="Nội thất">🛋️ Nội thất (Giường, tủ, cửa)</Select.Option>
              <Select.Option value="Khác">❓ Khác</Select.Option>
            </Select>
          </AntForm.Item>

          <AntForm.Item label="Tiêu đề sự cố" name="title" rules={[{ required: true, message: 'Nhập tiêu đề sự cố!' }]}>
            <Input placeholder="Ví dụ: Thay bóng đèn ban công, sửa vòi sen rỉ..." />
          </AntForm.Item>

          <AntForm.Item label="Mô tả chi tiết" name="desc">
            <Input.TextArea rows={3} placeholder="Mô tả cụ thể hoặc ghi chú thợ sửa..." />
          </AntForm.Item>

          <AntForm.Item label="Trạng thái ban đầu" name="status" initialValue="pending">
            <Select options={[
              { value: 'pending', label: '🟠 Chờ xử lý' },
              { value: 'processing', label: '🔵 Đang tiến hành sửa' },
              { value: 'done', label: '🟢 Đã hoàn thành' }
            ]} />
          </AntForm.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <Button onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" style={{ background: '#ff6b00', borderColor: '#ff6b00' }}>Lưu thông tin</Button>
          </div>
        </AntForm>
      </Modal>

      {/* MODAL CHI TIẾT SỰ CỐ */}
      <Modal
        title={`🛠️ Chi tiết báo cáo sự cố #${selectedMR?.id}`}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>Đóng</Button>
        ]}
      >
        {selectedMR && (
          <div style={{ fontSize: 13, lineHeight: 1.8 }}>
            <p><strong>Phòng:</strong> #{selectedMR.roomId}</p>
            <p><strong>Tiêu đề:</strong> {selectedMR.title}</p>
            <p><strong>Danh mục:</strong> {selectedMR.category}</p>
            <p><strong>Người báo cáo:</strong> {selectedMR.reporter || 'Khách thuê'} — SĐT: {selectedMR.phone || '0987654321'}</p>
            <p><strong>Ngày ghi nhận:</strong> {selectedMR.date}</p>
            {selectedMR.resolvedDate && <p><strong>Ngày hoàn thành:</strong> {selectedMR.resolvedDate}</p>}
            <div style={{ background: '#f5f5f5', padding: 10, borderRadius: 8, marginTop: 10 }}>
              <strong>Mô tả chi tiết:</strong>
              <div>{selectedMR.desc || 'Không có mô tả chi tiết bổ sung.'}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// =========================================================================
// COMPONENT: BÁO CÁO & THỐNG KÊ (DÀNH CHO CHỦ NHÀ) - TÍCH HỢP ĐỒNG BỘ DỮ LIỆU
// =========================================================================
const AnalyticsReportView = ({ rooms, requests, mrList }) => {
  // Thống kê động
  const totalRooms = rooms.length;
  const rentedRooms = rooms.filter(r => r.status === 'RENTED' || r.status === 'Rented').length;
  const availableRooms = rooms.filter(r => r.status === 'AVAILABLE' || r.status === 'Available').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'MAINTENANCE' || r.status === 'Maintenance').length;

  const totalCurrentRevenue = rooms
    .filter(r => r.status === 'RENTED' || r.status === 'Rented')
    .reduce((sum, r) => sum + Number(r.price || 0), 0);

  const potentialRevenue = rooms.reduce((sum, r) => sum + Number(r.price || 0), 0);

  const pendingRequestsCount = requests.filter(r => r.status === 'PENDING').length;
  const pendingMrCount = mrList.filter(mr => mr.status === 'pending' || mr.status === 'processing').length;

  const occupancyRate = totalRooms > 0 ? Math.round((rentedRooms / totalRooms) * 100) : 0;

  const revenueHistory = [
    { month: 'Tháng 2', revenue: Math.round(totalCurrentRevenue * 0.82) },
    { month: 'Tháng 3', revenue: Math.round(totalCurrentRevenue * 0.88) },
    { month: 'Tháng 4', revenue: Math.round(totalCurrentRevenue * 0.90) },
    { month: 'Tháng 5', revenue: Math.round(totalCurrentRevenue * 0.95) },
    { month: 'Tháng 6', revenue: Math.round(totalCurrentRevenue * 0.98) },
    { month: 'Tháng 7', revenue: totalCurrentRevenue },
  ];

  const maxRev = Math.max(...revenueHistory.map(h => h.revenue), 1);

  return (
    <div style={{ padding: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h4 style={{ fontWeight: 800, color: '#111827', margin: 0 }}>
            📊 Báo cáo & Thống kê tình hình kinh doanh
          </h4>
          <span style={{ color: '#6b7280', fontSize: 13 }}>
            Dữ liệu trực tiếp được cập nhật theo thời gian thực từ hệ thống phòng trọ
          </span>
        </div>
        <Button
          icon={<ExportOutlined />}
          type="primary"
          style={{ background: '#ff6b00', borderColor: '#ff6b00', borderRadius: 8, fontWeight: 600 }}
          onClick={() => message.success('Xuất file Báo cáo Thống kê thành công!')}
        >
          Xuất Báo Cáo
        </Button>
      </div>

      {/* TỔNG QUAN FINANCIAL & OCCUPANCY METRICS */}
      <Row className="g-3 mb-4">
        <Col lg={3} sm={6} xs={12}>
          <AntCard className="shadow-sm border-0" style={{ borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#ff6b00' }}>
                <DollarOutlined />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>DOANH THU THỰC TẾ/THÁNG</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#ff6b00' }}>
                  {totalCurrentRevenue.toLocaleString()} đ
                </div>
                <small style={{ color: '#52c41a', fontSize: 11, fontWeight: 600 }}>
                  <RiseOutlined /> Đạt {potentialRevenue > 0 ? Math.round((totalCurrentRevenue / potentialRevenue) * 100) : 0}% công suất
                </small>
              </div>
            </div>
          </AntCard>
        </Col>

        <Col lg={3} sm={6} xs={12}>
          <AntCard className="shadow-sm border-0" style={{ borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#e6f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#1677ff' }}>
                <PieChartOutlined />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>TỶ LỆ LẤP ĐẦY PHÒNG</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#1677ff' }}>
                  {occupancyRate}%
                </div>
                <small style={{ color: '#8c8c8c', fontSize: 11 }}>
                  {rentedRooms}/{totalRooms} phòng đang hoạt động
                </small>
              </div>
            </div>
          </AntCard>
        </Col>

        <Col lg={3} sm={6} xs={12}>
          <AntCard className="shadow-sm border-0" style={{ borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fffbe6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#faad14' }}>
                <FileTextOutlined />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>YÊU CẦU THUÊ CHỜ DUYỆT</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#faad14' }}>
                  {pendingRequestsCount} yêu cầu
                </div>
                <small style={{ color: '#8c8c8c', fontSize: 11 }}>Cần xử lý phê duyệt ngay</small>
              </div>
            </div>
          </AntCard>
        </Col>

        <Col lg={3} sm={6} xs={12}>
          <AntCard className="shadow-sm border-0" style={{ borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fff2f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#ff4d4f' }}>
                <ExclamationCircleOutlined />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>SỰ CỐ CHƯA XỬ LÝ</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#ff4d4f' }}>
                  {pendingMrCount} báo cáo
                </div>
                <small style={{ color: '#ff4d4f', fontSize: 11 }}>Cần khắc phục bảo trì</small>
              </div>
            </div>
          </AntCard>
        </Col>
      </Row>

      {/* BIỂU ĐỒ DOANH THU & PHÂN BỔ TRẠNG THÁI PHÒNG */}
      <Row className="g-3 mb-4">
        <Col md={8} xs={12}>
          <AntCard title={<span style={{ fontWeight: 700, fontSize: 15 }}>📈 Biểu đồ tăng trưởng doanh thu (6 tháng gần nhất)</span>} className="shadow-sm border-0" style={{ borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 210, padding: '10px 20px 0 20px' }}>
              {revenueHistory.map((item, idx) => {
                const heightPercent = Math.round((item.revenue / maxRev) * 100);
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12%' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#1677ff', marginBottom: 6 }}>
                      {(item.revenue / 1000000).toFixed(1)}M
                    </div>
                    <div style={{ height: 140, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: '#f5f5f5', borderRadius: 8, padding: 2 }}>
                      <div
                        style={{
                          width: '100%',
                          height: `${heightPercent}%`,
                          background: idx === revenueHistory.length - 1 ? 'linear-gradient(180deg, #ff6b00 0%, #ff9800 100%)' : '#1677ff',
                          borderRadius: 6,
                          transition: 'height 0.5s ease-in-out'
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#4b5563', marginTop: 10 }}>{item.month}</span>
                  </div>
                );
              })}
            </div>
          </AntCard>
        </Col>

        <Col md={4} xs={12}>
          <AntCard title={<span style={{ fontWeight: 700, fontSize: 15 }}>📊 Trạng thái hệ thống phòng</span>} className="shadow-sm border-0" style={{ borderRadius: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 0' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>🔵 Đã cho thuê:</span>
                  <strong>{rentedRooms} phòng ({totalRooms > 0 ? Math.round((rentedRooms / totalRooms) * 100) : 0}%)</strong>
                </div>
                <Progress percent={totalRooms > 0 ? Math.round((rentedRooms / totalRooms) * 100) : 0} strokeColor="#1677ff" showInfo={false} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>🟢 Phòng trống khả dụng:</span>
                  <strong>{availableRooms} phòng ({totalRooms > 0 ? Math.round((availableRooms / totalRooms) * 100) : 0}%)</strong>
                </div>
                <Progress percent={totalRooms > 0 ? Math.round((availableRooms / totalRooms) * 100) : 0} strokeColor="#52c41a" showInfo={false} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>🟡 Đang bảo trì / Sửa chữa:</span>
                  <strong>{maintenanceRooms} phòng ({totalRooms > 0 ? Math.round((maintenanceRooms / totalRooms) * 100) : 0}%)</strong>
                </div>
                <Progress percent={totalRooms > 0 ? Math.round((maintenanceRooms / totalRooms) * 100) : 0} strokeColor="#faad14" showInfo={false} />
              </div>

              <hr style={{ margin: '8px 0', borderColor: '#f0f0f0' }} />

              <div style={{ background: '#fafafa', padding: 12, borderRadius: 10 }}>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Doanh thu tối đa tiềm năng:</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>
                  {potentialRevenue.toLocaleString()} VNĐ/tháng
                </div>
              </div>
            </div>
          </AntCard>
        </Col>
      </Row>

      {/* BẢNG CHI TIẾT DOANH THU THEO TỪNG PHÒNG */}
      <AntCard title={<span style={{ fontWeight: 700, fontSize: 15 }}>🏢 Bảng chi tiết hiệu suất kinh doanh từng phòng</span>} className="shadow-sm border-0" style={{ borderRadius: 16 }}>
        <Table
          dataSource={rooms}
          rowKey="id"
          pagination={false}
          scroll={{ x: 'max-content' }}
          columns={[
            {
              title: 'Mã phòng',
              dataIndex: 'id',
              key: 'id',
              render: (id) => <strong>#{id}</strong>,
            },
            {
              title: 'Tên phòng trọ',
              dataIndex: 'title',
              key: 'title',
            },
            {
              title: 'Loại phòng',
              dataIndex: 'roomType',
              key: 'roomType',
              render: (type) => <Tag color="blue">{type || 'Khép kín'}</Tag>
            },
            {
              title: 'Giá niêm yết',
              dataIndex: 'price',
              key: 'price',
              render: (val) => <strong style={{ color: '#ff6b00' }}>{Number(val).toLocaleString()} đ</strong>,
            },
            {
              title: 'Khách thuê hiện tại',
              dataIndex: 'tenantName',
              key: 'tenantName',
              render: (tenant, record) => (record.status === 'RENTED' || record.status === 'Rented') ? (tenant || 'Trần Thị Hương') : <span style={{ color: '#bfbfbf' }}>Chưa có</span>,
            },
            {
              title: 'Trạng thái',
              dataIndex: 'status',
              key: 'status',
              render: (st) => {
                if (st === 'RENTED' || st === 'Rented') return <Tag color="processing">Đã thuê</Tag>;
                if (st === 'AVAILABLE' || st === 'Available') return <Tag color="success">Trống</Tag>;
                return <Tag color="warning">Bảo trì</Tag>;
              }
            },
            {
              title: 'Thực thu tháng này',
              key: 'actualRevenue',
              render: (_, record) => {
                const isRented = record.status === 'RENTED' || record.status === 'Rented';
                return (
                  <strong style={{ color: isRented ? '#52c41a' : '#8c8c8c' }}>
                    {isRented ? `${Number(record.price).toLocaleString()} đ` : '0 đ'}
                  </strong>
                );
              }
            }
          ]}
        />
      </AntCard>
    </div>
  );
};

// =========================================================================
// COMPONENT: QUẢN LÝ PHÒNG DÀNH CHO NGƯỜI THUÊ (TENANT PORTAL)
// =========================================================================
const TenantRoomManagement = ({ requests, setRequests, rooms, user, onGoToSearch, mrList, setMrList }) => {
  const [showMR, setShowMR] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [selectedContractReq, setSelectedContractReq] = useState(null);

  const [mrForm, setMrForm] = useState({ title: '', category: 'Khác', desc: '' });

  // Tự động tìm phòng active được phê duyệt của người thuê hiện tại
  const activeContract = useMemo(() => {
    return requests.find(r => (r.status === 'APPROVED' || r.status === 'active'));
  }, [requests]);

  const activeRoomDetail = useMemo(() => {
    if (!activeContract) return null;
    return rooms.find(room => room.id === activeContract.roomId) || {
      id: activeContract.roomId,
      title: activeContract.roomTitle,
      addressDetail: '📍 Chi tiết địa chỉ phòng trọ',
      price: activeContract.price,
      landlordName: 'Nguyễn Minh Tuấn',
      landlordPhone: '0901234567',
      images: [{ url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80' }]
    };
  }, [activeContract, rooms]);

  const statusCfg = {
    APPROVED: { label: 'Active', bg: '#f6ffed', text: '#52c41a', border: '#b7eb8f' },
    active: { label: 'Active', bg: '#f6ffed', text: '#52c41a', border: '#b7eb8f' },
    REJECTED: { label: 'Từ chối', bg: '#fff2f0', text: '#ff4d4f', border: '#ffccc7' },
    rejected: { label: 'Từ chối', bg: '#fff2f0', text: '#ff4d4f', border: '#ffccc7' },
    PENDING: { label: 'Chờ duyệt', bg: '#fffbe6', text: '#faad14', border: '#ffe58f' },
    pending: { label: 'Chờ duyệt', bg: '#fffbe6', text: '#faad14', border: '#ffe58f' },
    cancelled: { label: 'Đã hủy', bg: '#f5f5f5', text: '#8c8c8c', border: '#d9d9d9' },
  };

  const mrStatusCfg = {
    pending: { label: 'Chờ xử lý', color: 'orange' },
    processing: { label: 'Đang sửa', color: 'blue' },
    done: { label: 'Hoàn thành', color: 'green' },
  };

  const handleAddMR = () => {
    if (!mrForm.title.trim()) return message.error('Vui lòng nhập tiêu đề sự cố!');
    const newMR = {
      id: `MR-0${mrList.length + 1}`,
      roomId: activeContract?.roomId || 'P101',
      title: mrForm.title,
      category: mrForm.category,
      date: new Date().toLocaleDateString('vi-VN'),
      resolvedDate: null,
      status: 'pending',
      reporter: user?.fullName || 'Trần Thị Hương',
      phone: user?.phone || '0987654321',
      desc: mrForm.desc
    };
    setMrList([newMR, ...mrList]);
    setShowMR(false);
    setMrForm({ title: '', category: 'Khác', desc: '' });
    message.success('Đã gửi báo cáo sự cố tới chủ nhà!');
  };

  const handleCancelRequest = (reqId) => {
    setRequests(requests.map(r => r.id === reqId ? { ...r, status: 'cancelled' } : r));
    message.info('Đã hủy yêu cầu thuê phòng.');
  };

  const handleDeleteRequest = (reqId) => {
    setRequests(requests.filter(r => r.id !== reqId));
    message.success('Đã xóa lịch sử yêu cầu.');
  };

  const handleOpenContractModal = (req) => {
    setSelectedContractReq(req || activeContract);
    setShowContract(true);
  };

  return (
    <div style={{ padding: '4px' }}>
      <h4 style={{ fontWeight: 800, color: '#111827', marginBottom: 20 }}>
        🏠 Quản lý phòng của tôi
      </h4>

      {/* 🟢 KHỐI 1: THÔNG TIN PHÒNG ĐANG THUÊ ACTIVE */}
      {activeContract && activeRoomDetail ? (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Phòng đang thuê (Active)
            </span>
            <span style={{ background: '#f6ffed', color: '#52c41a', border: '1px solid #b7eb8f', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
              ● Active
            </span>
          </div>

          <Row className="g-4 align-items-center">
            <Col md={4} xs={12}>
              <div style={{ borderRadius: 12, overflow: 'hidden', height: 180, background: '#f3f4f6' }}>
                <img
                  src={activeRoomDetail.images?.[0]?.url || activeRoomDetail.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80'}
                  alt="Phòng đang thuê"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </Col>

            <Col md={8} xs={12}>
              <h5 style={{ fontWeight: 800, color: '#111827', marginBottom: 6 }}>
                {activeRoomDetail.title}
              </h5>
              <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 12 }}>
                📍 {activeRoomDetail.addressDetail || activeRoomDetail.district}
              </p>

              <Row className="g-2 mb-3" style={{ fontSize: 13 }}>
                <Col sm={6}>
                  <span style={{ color: '#6b7280' }}>Giá thuê: </span>
                  <strong style={{ color: '#ff6b00', fontSize: 15 }}>{Number(activeRoomDetail.price || activeContract.price).toLocaleString()}đ/tháng</strong>
                </Col>
                <Col sm={6}>
                  <span style={{ color: '#6b7280' }}>Thời hạn HĐ: </span>
                  <strong>{activeContract.startDate} – {activeContract.endDate}</strong>
                </Col>
                <Col sm={12}>
                  <span style={{ color: '#6b7280' }}>Chủ nhà: </span>
                  <strong>{activeRoomDetail.landlordName || 'Nguyễn Minh Tuấn'} · {activeRoomDetail.landlordPhone || '0901234567'}</strong>
                </Col>
              </Row>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {['Điều hòa', 'Nóng lạnh', 'Wifi', 'Ban công', 'Tủ lạnh'].map((item, idx) => (
                  <span key={idx} style={{ background: '#f3f4f6', color: '#374151', padding: '2px 10px', borderRadius: 6, fontSize: 12 }}>
                    {item}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Button
                  type="primary"
                  style={{ background: '#ff6b00', borderColor: '#ff6b00', borderRadius: 8, fontWeight: 600 }}
                  onClick={() => setShowPayment(true)}
                >
                  💳 Thanh toán
                </Button>
                <Button
                  style={{ borderRadius: 8, fontWeight: 500 }}
                  onClick={() => setShowMR(true)}
                >
                  🛠️ Báo sự cố
                </Button>
                <Button
                  style={{ borderRadius: 8, fontWeight: 500 }}
                  onClick={() => handleOpenContractModal(activeContract)}
                >
                  📜 Xem hợp đồng
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px dashed #d9d9d9', padding: 30, marginBottom: 24, textAlign: 'center' }}>
          <Empty description="Bạn chưa có phòng trọ nào đang thuê active." />
          <Button type="primary" style={{ background: '#ff6b00', borderColor: '#ff6b00', marginTop: 12 }} onClick={onGoToSearch}>
            🔍 Tìm phòng trọ ngay
          </Button>
        </div>
      )}

      {/* 🛠️ KHỐI 2: YÊU CẦU SỬA CHỮA (MAINTENANCE) */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            🛠️ Yêu cầu sửa chữa ({mrList.length})
          </span>
          <Button
            type="primary"
            size="small"
            disabled={!activeContract}
            style={{ background: activeContract ? '#ff6b00' : '#d9d9d9', borderColor: activeContract ? '#ff6b00' : '#d9d9d9', borderRadius: 6, fontSize: 12 }}
            onClick={() => setShowMR(true)}
          >
            + Báo sự cố mới
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {mrList.map((mr) => {
            const cfg = mrStatusCfg[mr.status] || { label: mr.status, color: 'default' };
            return (
              <div
                key={mr.id}
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: '#f9fafb',
                  borderRadius: 10,
                  border: '1px solid #f3f4f6'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>
                    {mr.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    Danh mục: {mr.category} · Ngày gửi: {mr.date}
                    {mr.resolvedDate && ` · Hoàn thành: ${mr.resolvedDate}`}
                  </div>
                </div>
                <Tag color={cfg.color}>{cfg.label}</Tag>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📋 KHỐI 3: LỊCH SỬ GỬI YÊU CẦU THUÊ PHÒNG */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 16, letterSpacing: '0.5px' }}>
          📋 Lịch sử gửi yêu cầu thuê phòng
        </div>

        <Table
          dataSource={requests}
          rowKey="id"
          pagination={false}
          scroll={{ x: 'max-content' }}
          columns={[
            {
              title: 'STT',
              key: 'stt',
              width: 60,
              render: (_, __, index) => index + 1,
            },
            {
              title: 'Mã phòng',
              dataIndex: 'roomId',
              key: 'roomId',
              render: (id) => <strong>#{id}</strong>,
            },
            {
              title: 'Tên phòng trọ',
              dataIndex: 'roomTitle',
              key: 'roomTitle',
            },
            {
              title: 'Ngày bắt đầu',
              dataIndex: 'startDate',
              key: 'startDate',
            },
            {
              title: 'Tiền thuê',
              dataIndex: 'price',
              key: 'price',
              render: (val) => <strong style={{ color: '#ff6b00' }}>{Number(val).toLocaleString()}đ</strong>,
            },
            {
              title: 'Trạng thái',
              dataIndex: 'status',
              key: 'status',
              render: (st) => {
                const cfg = statusCfg[st] || statusCfg.pending;
                return (
                  <span
                    style={{
                      background: cfg.bg,
                      color: cfg.text,
                      border: `1px solid ${cfg.border}`,
                      padding: '2px 8px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {cfg.label}
                  </span>
                );
              },
            },
            {
              title: 'Thao tác',
              key: 'action',
              render: (_, record) => {
                const st = (record.status || '').toLowerCase();
                if (st === 'approved' || st === 'active') {
                  return (
                    <Button type="link" size="small" style={{ color: '#1677ff', padding: 0 }} onClick={() => handleOpenContractModal(record)}>
                      Xem HĐ
                    </Button>
                  );
                }
                if (st === 'rejected' || st === 'cancelled') {
                  return (
                    <Popconfirm title="Xóa lịch sử yêu cầu này?" onConfirm={() => handleDeleteRequest(record.id)} okText="Xóa" cancelText="Hủy">
                      <Button type="link" size="small" danger style={{ padding: 0 }}>
                        Xóa
                      </Button>
                    </Popconfirm>
                  );
                }
                if (st === 'pending') {
                  return (
                    <Popconfirm title="Hủy yêu cầu thuê này?" onConfirm={() => handleCancelRequest(record.id)} okText="Hủy YC" cancelText="Đóng">
                      <Button type="link" size="small" style={{ color: '#faad14', padding: 0 }}>
                        Hủy
                      </Button>
                    </Popconfirm>
                  );
                }
                return null;
              },
            },
          ]}
        />
      </div>

      {/* MODAL BÁO SỰ CỐ */}
      <Modal
        title="🛠️ Báo cáo sự cố / Sửa chữa"
        open={showMR}
        onCancel={() => setShowMR(false)}
        onOk={handleAddMR}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
        okButtonProps={{ style: { background: '#ff6b00', borderColor: '#ff6b00' } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, display: 'block' }}>Danh mục sự cố</label>
            <Select
              style={{ width: '100%' }}
              value={mrForm.category}
              onChange={(v) => setMrForm({ ...mrForm, category: v })}
              options={[
                { value: 'Điện lạnh', label: '❄️ Điện lạnh (Điều hòa, tủ lạnh...)' },
                { value: 'Nước', label: '🚰 Điện nước (Vòi nước, đường ống...)' },
                { value: 'Thiết bị', label: '💡 Thiết bị điện (Đèn, ổ cắm...)' },
                { value: 'Nội thất', label: '🛋️ Nội thất (Giường, tủ, cửa...)' },
                { value: 'Khác', label: '❓ Khác' },
              ]}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, display: 'block' }}>Tiêu đề sự cố</label>
            <Input
              placeholder="Ví dụ: Điều hòa chảy nước, vòi sen bị hỏng..."
              value={mrForm.title}
              onChange={(e) => setMrForm({ ...mrForm, title: e.target.value })}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, display: 'block' }}>Mô tả chi tiết</label>
            <Input.TextArea
              rows={3}
              placeholder="Mô tả cụ thể vị trí và tình trạng hư hỏng..."
              value={mrForm.desc}
              onChange={(e) => setMrForm({ ...mrForm, desc: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* MODAL THANH TOÁN */}
      <Modal
        title="💳 Thanh toán hóa đơn tháng hiện tại"
        open={showPayment}
        onCancel={() => setShowPayment(false)}
        footer={null}
        width={480}
      >
        {activeRoomDetail && (
          <div style={{ padding: '8px 0' }}>
            <div style={{ background: '#f9fafb', padding: 16, borderRadius: 12, marginBottom: 16, border: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span>Tiền thuê phòng (#{activeRoomDetail.id}):</span>
                <strong>{Number(activeRoomDetail.price || 4500000).toLocaleString()}đ</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span>Tiền điện (85 kWh x 3.500đ):</span>
                <strong>297.500đ</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span>Tiền nước:</span>
                <strong>100.000đ</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span>Internet:</span>
                <strong>100.000đ</strong>
              </div>
              <hr style={{ margin: '10px 0', borderColor: '#e5e7eb' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
                <strong style={{ color: '#111827' }}>Tổng thanh toán:</strong>
                <strong style={{ color: '#ff6b00', fontSize: 18 }}>{Number((activeRoomDetail.price || 4500000) + 497500).toLocaleString()}đ</strong>
              </div>
            </div>

            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Quét mã QR để chuyển khoản (VietQR)</div>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PAYMENT_${activeRoomDetail.id}`}
                alt="QR Payment"
                style={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
            </div>

            <Button
              type="primary"
              block
              size="large"
              style={{ background: '#ff6b00', borderColor: '#ff6b00', borderRadius: 8, fontWeight: 600 }}
              onClick={() => {
                setShowPayment(false);
                message.success('Đã gửi xác nhận thanh toán! Quản lý sẽ xác minh trong 15 phút.');
              }}
            >
              Xác nhận đã chuyển khoản
            </Button>
          </div>
        )}
      </Modal>

      {/* MODAL XEM HỢP ĐỒNG KHÁCH THUÊ */}
      <Modal
        title={`📜 Hợp đồng thuê nhà — Phòng ${selectedContractReq?.roomId || activeRoomDetail?.id || ''}`}
        open={showContract}
        onCancel={() => setShowContract(false)}
        footer={[
          <Button key="close" onClick={() => setShowContract(false)}>Đóng</Button>,
        ]}
        width={560}
      >
        <div style={{ padding: '8px 0', fontSize: 13, lineHeight: 1.7, color: '#374151' }}>
          <h6 style={{ textAlign: 'center', fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br />
            <small style={{ fontWeight: 400 }}>Độc lập – Tự do – Hạnh phúc</small>
          </h6>

          <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <strong>BÊN CHO THUÊ (BÊN A):</strong> {activeRoomDetail?.landlordName || 'Nguyễn Minh Tuấn'} — SĐT: {activeRoomDetail?.landlordPhone || '0901234567'}<br />
            <strong>BÊN THUÊ (BÊN B):</strong> {selectedContractReq?.tenantName || user?.fullName || 'Trần Thị Hương'} — SĐT: {selectedContractReq?.tenantPhone || '0987654321'}
          </div>

          <p><strong>1. Phòng thuê:</strong> #{selectedContractReq?.roomId || activeRoomDetail?.id} — {selectedContractReq?.roomTitle || activeRoomDetail?.title}</p>
          <p><strong>2. Thời hạn hợp đồng:</strong> (Từ {selectedContractReq?.startDate || '01/01/2026'} đến {selectedContractReq?.endDate || '01/01/2027'})</p>
          <p><strong>3. Giá thuê:</strong> {Number(selectedContractReq?.price || activeRoomDetail?.price || 4500000).toLocaleString()} VNĐ / tháng. Thanh toán từ ngày 01 – 05 hàng tháng.</p>
          <p><strong>4. Tiền cọc:</strong> {Number(selectedContractReq?.price || activeRoomDetail?.price || 4500000).toLocaleString()} VNĐ (1 tháng tiền nhà)</p>
          <p><strong>5. Trách nhiệm hai bên:</strong> Bảo quản tài sản, thanh toán đúng hạn, tuân thủ nội quy PCCC và an ninh trật tự.</p>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, textAlign: 'center' }}>
            <div>
              <strong>BÊN A (Chủ nhà)</strong><br />
              <span style={{ color: '#52c41a', fontSize: 12 }}>✓ Đã ký điện tử</span>
            </div>
            <div>
              <strong>BÊN B (Người thuê)</strong><br />
              <span style={{ color: '#52c41a', fontSize: 12 }}>✓ Đã ký điện tử</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ==========================================
// COMPONENT QUẢN LÝ PHÒNG (Dành cho Chủ nhà)
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

  const handleSubmitForm = async (values) => {
    try {
      if (editingRoom) {
        await roomApi.updateRoom(editingRoom.id, values);
        setRooms(rooms.map(r => r.id === editingRoom.id ? { ...r, ...values } : r));
        message.success(`Đã cập nhật thông tin phòng #${editingRoom.id}!`);
      } else {
        const res = await roomApi.createRoom(values);
        const newRoom = res.data || {
          id: `P${Math.floor(100 + Math.random() * 900)}`,
          ...values,
          status: 'AVAILABLE',
          tenantName: '',
          images: [{ id: Date.now(), url: values.firstImageUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=80' }]
        };
        setRooms([newRoom, ...rooms]);
        message.success(`Đã tạo thành công phòng trọ mới!`);
      }
    } catch (err) {
      if (editingRoom) {
        setRooms(rooms.map(r => r.id === editingRoom.id ? { ...r, ...values } : r));
      } else {
        const newRoom = {
          id: `P${Math.floor(100 + Math.random() * 900)}`,
          ...values,
          status: 'AVAILABLE',
          tenantName: '',
          images: [{ id: Date.now(), url: values.firstImageUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=80' }]
        };
        setRooms([newRoom, ...rooms]);
      }
      message.success(`Thao tác thành công!`);
    }
    setIsModalOpen(false);
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      await roomApi.deleteRoom(roomId);
    } catch (e) {}
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
    const updated = rooms.map(r => r.id === selectedRoomForImages.id ? { ...r, images: [...(r.images || []), newImg] } : r);
    setRooms(updated);
    setSelectedRoomForImages({ ...selectedRoomForImages, images: [...(selectedRoomForImages.images || []), newImg] });
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
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status, record) => status === 'AVAILABLE' || status === 'Available' ? <Tag icon={<CheckCircleOutlined />} color="success">Sẵn sàng</Tag> : status === 'RENTED' || status === 'Rented' ? <Tag color="processing">Đã cho thuê ({record.tenantName || 'Khách'})</Tag> : <Tag icon={<ToolOutlined />} color="warning">Bảo trì</Tag> },
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
      <Table columns={columns} dataSource={rooms} rowKey="id" pagination={{ pageSize: 5 }} scroll={{ x: 'max-content' }} />

      <Modal title={editingRoom ? `✏️ Chỉnh sửa phòng #${editingRoom.id}` : '➕ Đăng bài phòng trọ mới'} open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} destroyOnClose>
        <AntForm form={form} layout="vertical" onFinish={handleSubmitForm}>
          <AntForm.Item label="Tiêu đề" name="title" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}><Input /></AntForm.Item>
          <Row>
            <Col sm={6} xs={12}><AntForm.Item label="Quận / Huyện" name="district" rules={[{ required: true, message: 'Nhập quận/huyện' }]}><Input /></AntForm.Item></Col>
            <Col sm={6} xs={12}><AntForm.Item label="Địa chỉ chi tiết" name="addressDetail" rules={[{ required: true, message: 'Nhập địa chỉ' }]}><Input /></AntForm.Item></Col>
          </Row>
          <Row>
            <Col sm={6} xs={12}><AntForm.Item label="Giá (đ/tháng)" name="price" rules={[{ required: true, type: 'number', min: 1 }]}><InputNumber style={{ width: '100%' }} /></AntForm.Item></Col>
            <Col sm={6} xs={12}><AntForm.Item label="Diện tích (m²)" name="area" rules={[{ required: true, type: 'number', min: 1 }]}><InputNumber style={{ width: '100%' }} /></AntForm.Item></Col>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
          {selectedRoomForImages?.images?.map((img) => (
            <div key={img.id} style={{ position: 'relative' }}>
              <img src={img.url || img.imageUrl} alt="Room" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4 }} />
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
// COMPONENT DUYỆT YÊU CẦU (Dành cho Chủ nhà)
// ==========================================
const ApproveRequestsView = ({ requests, onApprove, onReject }) => {
  const columns = [
    { title: 'Mã YC & Phòng', dataIndex: 'roomTitle', key: 'roomTitle', render: (text, record) => <div><strong style={{ color: '#1677ff' }}>{text}</strong><div style={{ fontSize: '12px', color: '#8c8c8c' }}>Phòng: #{record.roomId} | Mã YC: {record.id}</div></div> },
    { title: 'Khách thuê', dataIndex: 'tenantName', key: 'tenantName', render: (text, record) => <div><div><UserOutlined /> <strong>{text}</strong></div><small style={{ color: '#595959' }}>📞 {record.tenantPhone}</small></div> },
    { title: 'Thời hạn', key: 'duration', render: (_, record) => `${record.startDate} ➔ ${record.endDate}` },
    { title: 'Giá thuê', dataIndex: 'price', key: 'price', render: (price) => <strong style={{ color: '#ff4d4f' }}>{Number(price).toLocaleString()} đ/tháng</strong> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => status === 'PENDING' ? <Badge status="processing" text={<Tag color="gold">Chờ phê duyệt</Tag>} /> : status === 'APPROVED' ? <Tag color="green">Đã phê duyệt</Tag> : <Tag color="red">Đã từ chối</Tag> },
    { title: 'Hành động', key: 'action', render: (_, record) => record.status === 'PENDING' ? (
      <Space>
        <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => onApprove(record.id, record.roomId, record.tenantName)}>Duyệt</Button>
        <Popconfirm title="Từ chối yêu cầu này?" onConfirm={() => onReject(record.id, record.roomId, record.tenantName)} okText="Từ chối" cancelText="Hủy" okButtonProps={{ danger: true }}>
          <Button danger size="small" icon={<CloseOutlined />}>Từ chối</Button>
        </Popconfirm>
      </Space>
    ) : <span style={{ color: '#8c8c8c', fontSize: '12px' }}>Đã xử lý</span> }
  ];

  return (
    <AntCard title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>📋 Danh sách yêu cầu thuê chờ phê duyệt</span>} className="shadow-sm border-0" style={{ borderRadius: 16 }}>
      <Table columns={columns} dataSource={requests} rowKey="id" pagination={{ pageSize: 5 }} scroll={{ x: 'max-content' }} />
    </AntCard>
  );
};

// ==========================================
// MAIN COMPONENT: HOME
// ==========================================
const Home = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [activeNav, setActiveNav] = useState('home');
  const [collapsed, setCollapsed] = useState(false);

  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [mrList, setMrList] = useState(INITIAL_MAINTENANCE_REPORTS);
  const [favorites, setFavorites] = useState(['P101', 'P202', 'P301']);

  // STATE DÀNH RIÊNG CHO TÍNH NĂNG THÔNG BÁO
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

  // Filter State
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [hasAc, setHasAc] = useState(false);
  const [hasWm, setHasWm] = useState(false);

  // Modals User
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [selectedRoomForRent, setSelectedRoomForRent] = useState(null);
  const [rentStep, setRentStep] = useState(1);
  const [rentSuccess, setRentSuccess] = useState(false);

  // STATE DÀNH RIÊNG CHO TÍNH NĂNG Xem chi tiết phòng trọ
  const [selectedRoomDetail, setSelectedRoomDetail] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [profileForm] = AntForm.useForm();
  const [passwordForm] = AntForm.useForm();
  const [rentalForm] = AntForm.useForm();

  

  // Load danh sách phòng từ API khi khởi chạy
  useEffect(() => {
    const fetchAvailableRooms = async () => {
      try {
        const res = await roomApi.getAllAvailable();
        if (res.data && Array.isArray(res.data)) {
          setRooms(res.data);
        }
      } catch (err) {
        console.log('Chưa kết nối API, dùng dữ liệu khởi tạo');
      }
    };
    fetchAvailableRooms();
  }, []);

  useEffect(() => {
    const savedProfile = localStorage.getItem('saved_user_profile');
    const localUser = localStorage.getItem('user');
    let userData = null;

    if (savedProfile) try { userData = JSON.parse(savedProfile); } catch (e) {}
    else if (localUser) try { userData = JSON.parse(localUser); } catch (e) {}

    if (userData) {
      if (!userData.role) userData.role = 'TENANT';
      setUser(userData);
    } else {
      setUser({ username: 'Trần Thị Hương', fullName: 'Trần Thị Hương', role: 'TENANT' });
    }

    const savedFavs = localStorage.getItem('favorite_rooms');
    if (savedFavs) try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}

    const savedNotifs = localStorage.getItem('notifications');
    if (savedNotifs) try { setNotifications(JSON.parse(savedNotifs)); } catch (e) {}
  }, []);

  const saveNotificationsToStorage = (updatedNotifs) => {
    setNotifications(updatedNotifs);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifs));
  };

  const isLandlord = user?.role === 'LANDLORD' || user?.role === 'Landlord';

  const addNotification = (title, content, type = 'SYSTEM') => {
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      title,
      content,
      time: 'Vừa xong',
      isRead: false,
      type
    };
    saveNotificationsToStorage([newNotif, ...notifications]);
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    saveNotificationsToStorage(updated);
    message.success('Đã đánh dấu tất cả là đã đọc!');
  };

  const handleReadSingleNotif = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    saveNotificationsToStorage(updated);
  };

  const handleOpenDetailModal = async (room, e) => {
    if (e) e.stopPropagation();
    setIsDetailModalOpen(true);
    setLoadingDetail(true);
    setActiveImageIndex(0);
    try {
      const res = await roomApi.getDetail(room.id);
      setSelectedRoomDetail(res.data || room);
    } catch (err) {
      setSelectedRoomDetail(room);
    } finally {
      setLoadingDetail(false);
    }
  };

  // PHÊ DUYỆT YÊU CẦU THUÊ PHÒNG (ĐỒNG BỘ ĐỘNG TRẠNG THÁI TOÀN HỆ THỐNG)
  const handleApproveRequest = (requestId, roomId, tenantName) => {
    // 1. Cập nhật danh sách yêu cầu thuê
    const updatedRequests = requests.map(req => {
      if (req.id === requestId) return { ...req, status: 'APPROVED' };
      if (req.roomId === roomId && req.status === 'PENDING') return { ...req, status: 'REJECTED' };
      return req;
    });
    setRequests(updatedRequests);

    // 2. Cập nhật phòng tương ứng sang RENTED
    const updatedRooms = rooms.map(room => {
      if (room.id === roomId) {
        return { ...room, status: 'RENTED', tenantName: tenantName };
      }
      return room;
    });
    setRooms(updatedRooms);

    addNotification(
      'Yêu cầu thuê đã được duyệt',
      `Yêu cầu thuê phòng #${roomId} cho người thuê ${tenantName} đã được phê duyệt thành công.`,
      'SUCCESS'
    );

    message.success(`Đã phê duyệt! Phòng #${roomId} đã cập nhật sang "Đã cho thuê" & Hợp đồng tự động khởi tạo.`);
  };

  const handleRejectRequest = (requestId, roomId, tenantName) => {
    setRequests(requests.map(req => req.id === requestId ? { ...req, status: 'REJECTED' } : req));
    
    addNotification(
      'Từ chối yêu cầu thuê',
      `Yêu cầu thuê phòng #${roomId} của ${tenantName} đã bị từ chối.`,
      'WARNING'
    );

    message.warning(`Đã từ chối yêu cầu #${requestId}.`);
  };

  const toggleFavorite = (roomId, e) => {
    if (e) e.stopPropagation();
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

  const handleOpenRentModal = (room, e) => {
    if (e) e.stopPropagation();
    setSelectedRoomForRent(room);
    setRentStep(1);
    setRentSuccess(false);
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
      startDate: values.startDate || '2026-08-01',
      endDate: values.endDate || '2027-08-01',
      price: selectedRoomForRent.price,
      status: 'PENDING'
    };
    setRequests([newReq, ...requests]);

    addNotification(
      'Gửi yêu cầu thuê phòng',
      `Yêu cầu thuê phòng #${selectedRoomForRent.id} của bạn đã được gửi thành công đến chủ nhà.`,
      'REQUEST'
    );

    setRentSuccess(true);
    setTimeout(() => {
      setIsRentalModalOpen(false);
      setRentSuccess(false);
      message.success('Gửi yêu cầu thuê thành công!');
    }, 1800);
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchTitle = searchKeyword ? removeVietnameseTones(room.title).includes(removeVietnameseTones(searchKeyword)) || removeVietnameseTones(room.id).includes(removeVietnameseTones(searchKeyword)) : true;
      const matchDistrict = selectedLocation ? removeVietnameseTones(room.district).includes(removeVietnameseTones(selectedLocation)) : true;
      const matchType = selectedRoomType ? room.roomType === selectedRoomType : true;
      const matchPrice = Number(room.price) <= Number(maxPrice);
      const matchAc = hasAc ? Boolean(room.hasAc) === true : true;
      const matchWm = hasWm ? Boolean(room.hasWm) === true : true;
      return matchTitle && matchDistrict && matchType && matchPrice && matchAc && matchWm;
    });
  }, [rooms, searchKeyword, selectedLocation, selectedRoomType, maxPrice, hasAc, hasWm]);

  const favoriteRoomsList = useMemo(() => {
    return rooms.filter(room => favorites.includes(room.id));
  }, [rooms, favorites]);

  const approvedRequests = useMemo(() => {
    return requests.filter(req => req.status === 'APPROVED' || req.status === 'active');
  }, [requests]);

  const unreadNotifCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const settingsMenuItems = [
    { key: 'profile', icon: <EditOutlined />, label: 'Cập nhật thông tin', onClick: handleOpenProfileModal },
    { key: 'switch-mode', icon: <SwapOutlined style={{ color: '#1677ff' }} />, label: <span>Chuyển sang: <strong style={{ color: '#1677ff' }}>{isLandlord ? 'Người thuê' : 'Chủ nhà'}</strong></span>, onClick: handleSwitchMode },
    { key: 'password', icon: <LockOutlined />, label: 'Đổi mật khẩu', onClick: handleOpenPasswordModal },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true, onClick: onLogout }
  ];

  const displayName = user?.fullName || user?.username || 'Trần Thị Hương';

  const totalRoomsCount = rooms.length;
  const rentedRoomsCount = rooms.filter(r => r.status === 'RENTED' || r.status === 'Rented').length;
  const availableRoomsCount = rooms.filter(r => r.status === 'AVAILABLE' || r.status === 'Available').length;
  const maintenanceRoomsCount = rooms.filter(r => r.status === 'MAINTENANCE' || r.status === 'Maintenance').length;

  const currentTotalRevenue = rooms
    .filter(r => r.status === 'RENTED' || r.status === 'Rented')
    .reduce((sum, r) => sum + Number(r.price || 0), 0);

  const pendingMrCountTotal = mrList.filter(i => i.status === 'pending' || i.status === 'processing').length;

  const revenueData = [
    { month: 'T1', val: `${Math.round(currentTotalRevenue * 0.75 / 1000000)}tr`, height: '65%' },
    { month: 'T2', val: `${Math.round(currentTotalRevenue * 0.82 / 1000000)}tr`, height: '70%' },
    { month: 'T3', val: `${Math.round(currentTotalRevenue * 0.88 / 1000000)}tr`, height: '78%' },
    { month: 'T4', val: `${Math.round(currentTotalRevenue * 0.90 / 1000000)}tr`, height: '82%' },
    { month: 'T5', val: `${Math.round(currentTotalRevenue * 0.95 / 1000000)}tr`, height: '88%' },
    { month: 'T6', val: `${Math.round(currentTotalRevenue * 0.98 / 1000000)}tr`, height: '92%' },
    { month: 'T7', val: `${Math.round(currentTotalRevenue / 1000000)}tr`, height: '98%' },
  ];

  const notificationPopoverContent = (
    <div style={{ width: 320 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
        <strong style={{ fontSize: 15 }}>🔔 Thông báo</strong>
        {unreadNotifCount > 0 && (
          <Button type="link" size="small" onClick={handleMarkAllAsRead} style={{ padding: 0, fontSize: 12 }}>
            Đánh dấu đã đọc
          </Button>
        )}
      </div>

      <List
        dataSource={notifications.slice(0, 5)}
        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có thông báo" /> }}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            onClick={() => handleReadSingleNotif(item.id)}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              borderRadius: 8,
              marginBottom: 4,
              background: item.isRead ? '#fff' : '#e6f7ff',
              transition: 'background 0.2s'
            }}
          >
            <List.Item.Meta
              avatar={
                item.type === 'SUCCESS' ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} /> :
                item.type === 'WARNING' ? <InfoCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} /> :
                <BellOutlined style={{ color: '#1677ff', fontSize: 18 }} />
              }
              title={<span style={{ fontSize: 13, fontWeight: item.isRead ? 'normal' : 'bold' }}>{item.title}</span>}
              description={
                <div>
                  <div style={{ fontSize: 12, color: '#595959' }}>{item.content}</div>
                  <small style={{ fontSize: 10, color: '#bfbfbf' }}>{item.time}</small>
                </div>
              }
            />
          </List.Item>
        )}
      />

      <div style={{ textAlign: 'center', marginTop: 10, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
        <Button type="link" size="small" onClick={() => setIsNotifModalOpen(true)}>
          Xem tất cả thông báo ➔
        </Button>
      </div>
    </div>
  );

  return (
    <div className={`layout-wrapper ${collapsed ? 'sidebar-collapsed' : ''}`} style={{ background: '#f4f6f8', minHeight: '100vh' }}>
      {/* SIDEBAR BÊN TRÁI */}
      <aside className="sidebar" style={{ background: '#121929' }}>
        <div className="sidebar-header" style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {!collapsed && (
            <div>
              <h5 style={{ color: '#ff6b00', margin: 0, fontWeight: 800, fontSize: '15px', letterSpacing: '0.5px' }}>
                {isLandlord ? 'LANDLORD PORTAL' : 'NGƯỜI THUÊ'}
              </h5>
              <div style={{ color: '#8c8c8c', fontSize: '11px' }}>Tenant Portal</div>
            </div>
          )}
          <Button type="text" icon={collapsed ? <MenuUnfoldOutlined style={{ color: '#fff', fontSize: '18px' }} /> : <MenuFoldOutlined style={{ color: '#fff', fontSize: '18px' }} />} onClick={() => setCollapsed(!collapsed)} />
        </div>

        <div className="sidebar-user-box" style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', margin: '12px', borderRadius: '12px' }}>
          <Avatar src={user?.avatar} icon={<UserOutlined />} style={{ backgroundColor: '#ff6b00', flexShrink: 0 }} />
          {!collapsed && (
            <div className="sidebar-user-info" style={{ marginLeft: '10px' }}>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: '13px' }}>{displayName}</div>
              <div style={{ color: '#52c41a', fontSize: '11px' }}>{approvedRequests.length > 0 ? `Phòng #${approvedRequests[0].roomId} • Active` : 'Chưa có phòng'}</div>
            </div>
          )}
        </div>

        <nav className="sidebar-menu">
          {!isLandlord ? (
            <>
              <div className={`menu-item ${activeNav === 'home' ? 'active' : ''}`} onClick={() => setActiveNav('home')} title="Trang chủ"><HomeOutlined className="menu-icon" /> {!collapsed && <span>Trang chủ</span>}</div>
              <div className={`menu-item ${activeNav === 'my-rent' ? 'active' : ''}`} onClick={() => setActiveNav('my-rent')} title="Quản lý phòng"><KeyOutlined className="menu-icon" /> {!collapsed && <span>Quản lý phòng</span>}</div>
              <div className={`menu-item ${activeNav === 'contracts' ? 'active' : ''}`} onClick={() => setActiveNav('contracts')} title="Hợp đồng"><FileTextOutlined className="menu-icon" /> {!collapsed && <span>Hợp đồng</span>}</div>
              <div className={`menu-item ${activeNav === 'favorites' ? 'active' : ''}`} onClick={() => setActiveNav('favorites')} title="Yêu thích"><HeartOutlined className="menu-icon" /> {!collapsed && <span>Yêu thích</span>}</div>
            </>
          ) : (
            <>
              <div className={`menu-item ${activeNav === 'home' ? 'active' : ''}`} onClick={() => setActiveNav('home')} title="Trang chủ"><BarChartOutlined className="menu-icon" /> {!collapsed && <span>Trang chủ</span>}</div>
              <div className={`menu-item ${activeNav === 'my-rooms' ? 'active' : ''}`} onClick={() => setActiveNav('my-rooms')} title="Đăng bài & Phòng"><AppstoreOutlined className="menu-icon" /> {!collapsed && <span>Đăng bài & Phòng</span>}</div>
              <div className={`menu-item ${activeNav === 'approve' ? 'active' : ''}`} onClick={() => setActiveNav('approve')} title="Duyệt yêu cầu"><FileTextOutlined className="menu-icon" /> {!collapsed && <span>Duyệt yêu cầu ({requests.filter((r) => r.status === 'PENDING').length})</span>}</div>
              <div className={`menu-item ${activeNav === 'maintenance' ? 'active' : ''}`} onClick={() => setActiveNav('maintenance')} title="Quản lý Bảo trì"><ToolOutlined className="menu-icon" /> {!collapsed && <span>Quản lý Bảo trì {pendingMrCountTotal > 0 && <Badge count={pendingMrCountTotal} overflowCount={99} style={{ marginLeft: 6, backgroundColor: '#ff6b00' }} />}</span>}</div>
              <div className={`menu-item ${activeNav === 'analytics' ? 'active' : ''}`} onClick={() => setActiveNav('analytics')} title="Báo cáo (Quản lý)"><PieChartOutlined className="menu-icon" /> {!collapsed && <span>Báo cáo & Thống kê</span>}</div>
            </>
          )}
        </nav>
      </aside>

      {/* NỘI DUNG CHÍNH BÊN PHẢI */}
      <main className="main-content">
        <header className="top-header" style={{ background: '#fff', borderBottom: '1px solid #e8e8e8', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#8c8c8c', fontSize: '13px' }}>👤 Chào, {displayName}</span>
            <span style={{ color: '#1890ff', fontWeight: 600, fontSize: '13px' }}>
              {activeNav === 'analytics' ? 'Báo cáo & Thống kê' : activeNav === 'maintenance' ? 'Quản lý Bảo trì' : 'Trang chủ'}
            </span>
          </div>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 20px' }}>
            <Input prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />} placeholder="🔍 Tìm phòng nhanh..." style={{ width: '100%', maxWidth: 320, borderRadius: 20, background: '#f5f5f5', border: 'none' }} value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Popover content={notificationPopoverContent} trigger="click" placement="bottomRight">
              <Badge count={unreadNotifCount} size="small">
                <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: '18px', color: '#595959' }} />} />
              </Badge>
            </Popover>

            <Dropdown menu={{ items: settingsMenuItems }} trigger={['click']} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <Avatar src={user?.avatar} icon={<UserOutlined />} size="small" style={{ backgroundColor: '#ff6b00' }} />
                <span style={{ fontWeight: 600, fontSize: '13px', color: '#262626' }}>{displayName}</span>
                <span style={{ fontSize: '11px', color: '#8c8c8c' }}>{isLandlord ? 'Chủ nhà' : 'Người thuê'}</span>
                <DownOutlined style={{ fontSize: '10px', color: '#8c8c8c' }} />
              </div>
            </Dropdown>
          </div>
        </header>

        <div className="content-body" style={{ padding: '24px' }}>
          {/* TRANG CHỦ CHỦ NHÀ / ADMIN */}
          {isLandlord && activeNav === 'home' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 style={{ fontWeight: 700, color: '#1f2937', margin: 0, fontSize: 24 }}>
                    Chào buổi sáng, {displayName}! 👋
                  </h3>
                  <div style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
                    Đây là tổng quan hệ thống quản lý bất động sản của bạn
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Button icon={<ExportOutlined />} style={{ borderRadius: 8, height: 40, fontWeight: 500 }} onClick={() => setActiveNav('analytics')}>
                    Báo cáo chi tiết
                  </Button>
                  <Button type="primary" icon={<PlusOutlined />} style={{ background: '#ff6b00', borderColor: '#ff6b00', borderRadius: 8, height: 40, fontWeight: 600 }} onClick={() => setActiveNav('my-rooms')}>
                    + Thêm phòng
                  </Button>
                </div>
              </div>

              {/* HÀNG THỐNG KÊ CHỦ NHÀ ĐỒNG BỘ */}
              <Row className="g-3 mb-4">
                <Col xs={12} sm={6} md={4} lg={2}>
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

                <Col xs={12} sm={6} md={4} lg={2}>
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

                <Col xs={12} sm={6} md={4} lg={2}>
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

                <Col xs={12} sm={6} md={4} lg={2}>
                  <div style={{ background: '#fff', borderRadius: 16, padding: '16px', border: '1px solid #ffe8cc', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💰</div>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Doanh thu/tháng</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#ff6b00' }}>
                          {(currentTotalRevenue / 1000000).toFixed(1)} tr
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>

                <Col xs={12} sm={6} md={4} lg={2}>
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

                <Col xs={12} sm={6} md={4} lg={2}>
                  <div
                    style={{ background: '#fff', borderRadius: 16, padding: '16px', border: '1px solid #f0f0f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', cursor: 'pointer' }}
                    onClick={() => setActiveNav('maintenance')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: '#fffbe6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🔧</div>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Đang bảo trì</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#faad14' }}>{pendingMrCountTotal}</div>
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
                      <Progress type="dashboard" percent={totalRoomsCount > 0 ? Math.round((rentedRoomsCount / totalRoomsCount) * 100) : 0} strokeColor="#ff6b00" size={140} />
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
                      Đã lấp đầy {rentedRoomsCount}/{totalRoomsCount} phòng trọ
                    </div>
                  </div>
                </Col>
              </Row>
            </>
          )}

          {/* TRANG CHỦ NGƯỜI THUÊ (TENANT) */}
          {!isLandlord && activeNav === 'home' && (
            <div>
              {/* CHÀO MỎI SÁNG & PILL THỐNG KÊ */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: 0 }}>
                  Chào buổi sáng, {displayName.split(' ').pop()}! 👏
                </h3>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: '4px 0 16px 0' }}>
                  Tìm phòng trọ ưng ý hoặc quản lý phòng đang thuê
                </p>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Button
                    style={{ borderRadius: 20, background: '#fff0f2', borderColor: '#ffd6e0', color: '#ff4d4f', fontWeight: 600, fontSize: 13 }}
                    onClick={() => setActiveNav('favorites')}
                  >
                    💖 Yêu thích ({favorites.length})
                  </Button>
                  <Button
                    style={{ borderRadius: 20, background: '#f6ffed', borderColor: '#b7eb8f', color: '#52c41a', fontWeight: 600, fontSize: 13 }}
                    onClick={() => setActiveNav('contracts')}
                  >
                    📜 Hợp đồng hiện tại ({approvedRequests.length})
                  </Button>
                  <Button
                    style={{ borderRadius: 20, background: '#e6f7ff', borderColor: '#91caff', color: '#1890ff', fontWeight: 600, fontSize: 13 }}
                    onClick={() => setActiveNav('my-rent')}
                  >
                    💳 Hóa đơn chờ (1)
                  </Button>
                </div>
              </div>

              {/* BỘ LỌC TÌM KIẾM NÂNG CAO */}
              <AntCard className="shadow-sm border-0 mb-4" style={{ borderRadius: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.5px' }}>
                  🔍 Bộ lọc tìm kiếm nâng cao
                </div>
                <Row className="g-2 align-items-center">
                  <Col md={5} xs={12}>
                    <Input
                      prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                      placeholder="Tìm theo mã phòng, khu vực, loại phòng..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      style={{ borderRadius: 8 }}
                      allowClear
                    />
                  </Col>
                  <Col md={2} xs={6}>
                    <Select
                      style={{ width: '100%' }}
                      placeholder="Khu vực"
                      allowClear
                      onChange={(v) => setSelectedLocation(v || '')}
                    >
                      <Select.Option value="Cầu Giấy">Cầu Giấy</Select.Option>
                      <Select.Option value="Nam Từ Liêm">Nam Từ Liêm</Select.Option>
                      <Select.Option value="Thanh Xuân">Thanh Xuân</Select.Option>
                      <Select.Option value="Tây Hồ">Tây Hồ</Select.Option>
                    </Select>
                  </Col>
                  <Col md={2} xs={6}>
                    <Select
                      style={{ width: '100%' }}
                      placeholder="Loại phòng"
                      allowClear
                      onChange={(v) => setSelectedRoomType(v || '')}
                    >
                      <Select.Option value="Studio">Studio</Select.Option>
                      <Select.Option value="1 phòng ngủ">1 phòng ngủ</Select.Option>
                      <Select.Option value="Khép kín">Khép kín</Select.Option>
                    </Select>
                  </Col>
                  <Col md={2} xs={8}>
                    <div style={{ fontSize: 11, color: '#595959' }}>
                      Giá tối đa: <strong style={{ color: '#ff6b00' }}>{(maxPrice / 1000000).toFixed(1)}tr</strong>
                    </div>
                    <Slider min={1000000} max={10000000} step={500000} value={maxPrice} onChange={(v) => setMaxPrice(v)} tooltip={{ formatter: null }} />
                  </Col>
                  <Col md={1} xs={4} style={{ textAlign: 'right' }}>
                    <Button
                      style={{ borderRadius: 8, fontSize: 12 }}
                      onClick={() => { setSearchKeyword(''); setSelectedLocation(''); setSelectedRoomType(''); setMaxPrice(10000000); setHasAc(false); setHasWm(false); }}
                    >
                      Xóa lọc
                    </Button>
                  </Col>
                </Row>
              </AntCard>

              {/* TỰA ĐỀ DANH SÁCH PHÒNG TRỌ ĐỀ XUẤT */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h5 style={{ fontWeight: 700, margin: 0, color: '#1f2937', fontSize: 16 }}>
                  🏠 Phòng trọ được đề xuất <span style={{ color: '#8c8c8c', fontWeight: 400, fontSize: 14 }}>({filteredRooms.length} phòng)</span>
                </h5>
                <Button type="link" style={{ padding: 0, color: '#ff6b00', fontWeight: 600 }}>Xem tất cả →</Button>
              </div>

              {/* LƯỚI CARD PHÒNG TRỌ (GRID 3 CỘT) */}
              <Row className="g-3">
                {filteredRooms.map((room) => {
                  const isFav = favorites.includes(room.id);
                  const isAvailable = room.status === 'AVAILABLE' || room.status === 'Available';
                  const mainImage = room.images?.[0]?.url || room.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=80';
                  const priceInTr = (room.price / 1000000).toFixed(1);

                  return (
                    <Col lg={4} md={6} xs={12} key={room.id}>
                      <div
                        style={{
                          borderRadius: 16,
                          overflow: 'hidden',
                          background: '#fff',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                          border: '1px solid #e8e8e8',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          height: '100%',
                          transition: 'transform 0.2s',
                        }}
                      >
                        <div>
                          {/* KHU VỰC ẢNH & LOẠI PHÒNG & THẢ TIM */}
                          <div style={{ position: 'relative', height: 190, overflow: 'hidden' }}>
                            <img src={mainImage} alt={room.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            
                            {/* HUY HIỆU LOẠI PHÒNG */}
                            <span style={{
                              position: 'absolute',
                              bottom: 12,
                              left: 12,
                              background: 'rgba(0, 0, 0, 0.65)',
                              color: '#fff',
                              padding: '3px 10px',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 500
                            }}>
                              {room.roomType || 'Khép kín'}
                            </span>

                            {/* NÚT THẢ TIM */}
                            <Button
                              shape="circle"
                              type="text"
                              icon={isFav ? <HeartFilled style={{ color: '#ff4d4f', fontSize: 16 }} /> : <HeartOutlined style={{ color: '#595959', fontSize: 16 }} />}
                              onClick={(e) => toggleFavorite(room.id, e)}
                              style={{ position: 'absolute', top: 12, right: 12, background: '#fff', border: 'none', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                            />
                          </div>

                          {/* KHU VỰC THÔNG TIN VĂN BẢN */}
                          <div style={{ padding: '16px 16px 10px 16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <h6 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#1f2937' }}>
                                {room.title}
                              </h6>
                              <div style={{ fontSize: 16, fontWeight: 800, color: '#ff6b00', whiteSpace: 'nowrap', marginLeft: 8 }}>
                                {priceInTr}tr<small style={{ fontSize: 11, fontWeight: 400, color: '#8c8c8c' }}>/th</small>
                              </div>
                            </div>

                            <div style={{ fontSize: 12, color: '#8c8c8c', margin: '6px 0 8px 0' }}>
                              📍 {room.addressDetail || `${room.district}, Hà Nội`} • {room.area} m²
                            </div>

                            {/* ĐÁNH GIÁ SAO */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                              <Stars rating={room.rating || 4.5} />
                              <strong style={{ color: '#262626' }}>{room.rating || 4.5}</strong>
                              <span style={{ color: '#8c8c8c' }}>({room.reviewCount || 20})</span>
                            </div>
                          </div>
                        </div>

                        {/* NÚT XEM & NÚT THUÊ */}
                        <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 10, background: '#fff' }}>
                          <Button
                            icon={<EyeOutlined />}
                            style={{ flex: 1, borderRadius: 8, height: 36, fontSize: 13 }}
                            onClick={(e) => handleOpenDetailModal(room, e)}
                          >
                            Xem
                          </Button>
                          <Button
                            type="primary"
                            disabled={!isAvailable}
                            style={{
                              flex: 1,
                              background: isAvailable ? '#0f172a' : '#d9d9d9',
                              borderColor: isAvailable ? '#0f172a' : '#d9d9d9',
                              borderRadius: 8,
                              height: 36,
                              fontWeight: 600,
                              fontSize: 13
                            }}
                            onClick={(e) => handleOpenRentModal(room, e)}
                          >
                            {isAvailable ? '🔑 Thuê' : 'Đã thuê'}
                          </Button>
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </div>
          )}

          {/* CÁC VIEW QUẢN LÝ CỦA CHỦ NHÀ */}
          {isLandlord && activeNav === 'my-rooms' && <MyRoomsView rooms={rooms} setRooms={setRooms} />}
          {isLandlord && activeNav === 'approve' && <ApproveRequestsView requests={requests} onApprove={handleApproveRequest} onReject={handleRejectRequest} />}
          {isLandlord && activeNav === 'maintenance' && (
            <MaintenanceManagementView
              mrList={mrList}
              setMrList={setMrList}
              rooms={rooms}
              setRooms={setRooms}
              addNotification={addNotification}
            />
          )}
          {isLandlord && activeNav === 'analytics' && <AnalyticsReportView rooms={rooms} requests={requests} mrList={mrList} />}

          {/* TAB "QUẢN LÝ PHÒNG" CỦA NGƯỜI THUÊ */}
          {!isLandlord && activeNav === 'my-rent' && (
            <TenantRoomManagement requests={requests} setRequests={setRequests} rooms={rooms} user={user} onGoToSearch={() => setActiveNav('home')} mrList={mrList} setMrList={setMrList} />
          )}

          {/* HỢP ĐỒNG CỦA KHÁCH THUÊ */}
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
                  scroll={{ x: 'max-content' }}
                />
              )}
            </AntCard>
          )}

          {/* DANH SÁCH YÊU THÍCH */}
          {!isLandlord && activeNav === 'favorites' && (
            <AntCard title="❤️ Danh sách phòng trọ đã lưu" className="shadow-sm border-0" style={{ borderRadius: 16 }}>
              <Row className="g-3">
                {favoriteRoomsList.length === 0 ? <p>Chưa có phòng nào trong danh sách yêu thích.</p> : favoriteRoomsList.map(room => (
                  <Col md={6} key={room.id}>
                    <div style={{ display: 'flex', gap: 12, padding: 10, border: '1px solid #f0f0f0', borderRadius: 8 }}>
                      <img src={room.images?.[0]?.url || room.images?.[0]?.imageUrl} alt="" style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 6 }} />
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

      {/* MODAL CHI TIẾT TẤT CẢ THÔNG BÁO */}
      <Modal
        title={<span style={{ fontSize: 18, fontWeight: 'bold' }}>🔔 Tất cả thông báo ({notifications.length})</span>}
        open={isNotifModalOpen}
        onCancel={() => setIsNotifModalOpen(false)}
        footer={[
          <Button key="mark-all" onClick={handleMarkAllAsRead}>Đánh dấu tất cả đã đọc</Button>,
          <Button key="close" type="primary" onClick={() => setIsNotifModalOpen(false)}>Đóng</Button>
        ]}
      >
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              onClick={() => handleReadSingleNotif(item.id)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderRadius: 8,
                marginBottom: 8,
                background: item.isRead ? '#fafafa' : '#e6f7ff',
                border: '1px solid #f0f0f0'
              }}
            >
              <List.Item.Meta
                avatar={
                  item.type === 'SUCCESS' ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 22 }} /> :
                  item.type === 'WARNING' ? <InfoCircleOutlined style={{ color: '#ff4d4f', fontSize: 22 }} /> :
                  <BellOutlined style={{ color: '#1677ff', fontSize: 22 }} />
                }
                title={<strong style={{ fontSize: 14 }}>{item.title}</strong>}
                description={
                  <div>
                    <p style={{ margin: '4px 0', color: '#262626' }}>{item.content}</p>
                    <small style={{ color: '#8c8c8c' }}>{item.time}</small>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Modal>

      {/* MODAL XEM CHI TIẾT PHÒNG TRỌ */}
      <Modal
        title={<span style={{ fontSize: 18, fontWeight: 'bold' }}>🏠 Chi tiết phòng trọ #{selectedRoomDetail?.id}</span>}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        width={720}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>Đóng</Button>,
          <Button
            key="rent"
            type="primary"
            disabled={selectedRoomDetail?.status !== 'AVAILABLE' && selectedRoomDetail?.status !== 'Available'}
            style={{ background: '#ff6b00', borderColor: '#ff6b00' }}
            onClick={() => {
              setIsDetailModalOpen(false);
              handleOpenRentModal(selectedRoomDetail);
            }}
          >
            Gửi yêu cầu thuê
          </Button>
        ]}
      >
        <Spin spinning={loadingDetail}>
          {selectedRoomDetail && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ width: '100%', height: 300, borderRadius: 12, overflow: 'hidden', marginBottom: 10, background: '#f0f0f0' }}>
                  <img
                    src={selectedRoomDetail.images?.[activeImageIndex]?.url || selectedRoomDetail.images?.[activeImageIndex]?.imageUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=80'}
                    alt="Main Room"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                {selectedRoomDetail.images && selectedRoomDetail.images.length > 1 && (
                  <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
                    {selectedRoomDetail.images.map((img, index) => (
                      <img
                        key={img.id || index}
                        src={img.url || img.imageUrl}
                        alt="Thumbnail"
                        onClick={() => setActiveImageIndex(index)}
                        style={{
                          width: 80,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: 6,
                          cursor: 'pointer',
                          border: activeImageIndex === index ? '2px solid #ff6b00' : '1px solid #ddd',
                          opacity: activeImageIndex === index ? 1 : 0.6
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <h4 style={{ fontWeight: 'bold', color: '#1a2238', marginBottom: 4 }}>{selectedRoomDetail.title}</h4>
              <div style={{ fontSize: 22, fontWeight: 'bold', color: '#ff4d4f', marginBottom: 12 }}>
                {Number(selectedRoomDetail.price).toLocaleString()} đ <small style={{ fontSize: 13, color: '#8c8c8c' }}>/tháng</small>
              </div>

              <div style={{ background: '#e6f7ff', border: '1px solid #91caff', padding: '12px 16px', borderRadius: 10, marginBottom: 16 }}>
                <div style={{ fontWeight: 'bold', color: '#0958d9', fontSize: 14 }}>👤 Thông tin liên hệ Chủ nhà:</div>
                <div style={{ display: 'flex', gap: 20, marginTop: 6, fontSize: 14, flexWrap: 'wrap' }}>
                  <span><strong>Chủ phòng:</strong> {selectedRoomDetail.landlordName || selectedRoomDetail.landlord?.username || 'Chủ trọ Nguyễn Văn A'}</span>
                  <span style={{ color: '#ff4d4f' }}>
                    <PhoneOutlined /> <strong>SĐT:</strong> {selectedRoomDetail.landlordPhone || selectedRoomDetail.landlord?.phone || '0901234567'}
                  </span>
                </div>
              </div>

              <Row className="g-3 mb-3">
                <Col sm={6} xs={12}>
                  <p style={{ margin: 0 }}>📍 <strong>Địa chỉ:</strong> {selectedRoomDetail.addressDetail}, {selectedRoomDetail.district}</p>
                </Col>
                <Col sm={6} xs={12}>
                  <p style={{ margin: 0 }}>📐 <strong>Diện tích:</strong> {selectedRoomDetail.area} m²</p>
                </Col>
                <Col xs={12}>
                  <div>
                    <strong style={{ marginRight: 8 }}>Tiện ích đi kèm:</strong>
                    {selectedRoomDetail.hasAc && <Tag color="blue">Điều hòa</Tag>}
                    {selectedRoomDetail.hasWm && <Tag color="cyan">Máy giặt</Tag>}
                    {!selectedRoomDetail.hasAc && !selectedRoomDetail.hasWm && <span style={{ color: '#8c8c8c' }}>Không có tiện ích đặc biệt</span>}
                  </div>
                </Col>
              </Row>

              <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8 }}>
                <strong style={{ color: '#434343' }}>📝 Mô tả chi tiết:</strong>
                <p style={{ margin: '6px 0 0 0', color: '#595959', whiteSpace: 'pre-line' }}>{selectedRoomDetail.description || 'Không có mô tả chi tiết.'}</p>
              </div>
            </div>
          )}
        </Spin>
      </Modal>

      {/* POPUP YÊU CẦU THUÊ PHÒNG NÂNG CẤP (MULTI-STEP RENT MODAL) */}
      <Modal
        title={null}
        open={isRentalModalOpen}
        onCancel={() => setIsRentalModalOpen(false)}
        footer={null}
        width={480}
        destroyOnClose
      >
        {rentSuccess ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <CheckCircleOutlined style={{ fontSize: 54, color: '#52c41a', marginBottom: 12 }} />
            <h5 style={{ fontWeight: 700, margin: 0 }}>✅ Đã gửi yêu cầu thuê thành công!</h5>
            <p style={{ color: '#8c8c8c', fontSize: 13, marginTop: 8 }}>
              Yêu cầu thuê phòng #{selectedRoomForRent?.id} của bạn đã được chuyển đến quản lý.
            </p>
          </div>
        ) : (
          <div style={{ padding: '8px 4px' }}>
            <h5 style={{ fontWeight: 800, color: '#111827', margin: 0 }}>
              🚀 Đăng ký thuê {selectedRoomForRent?.title}
            </h5>
            <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 16px 0' }}>
              Điền thông tin để gửi yêu cầu giữ phòng tới quản lý tòa nhà
            </p>

            {/* THANH BƯỚC THUÊ */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 4, background: rentStep >= 1 ? '#ff6b00' : '#e5e7eb', borderRadius: 2 }} />
              <div style={{ flex: 1, height: 4, background: rentStep >= 2 ? '#ff6b00' : '#e5e7eb', borderRadius: 2 }} />
            </div>

            <AntForm
              form={rentalForm}
              layout="vertical"
              onFinish={handleSendRentRequest}
              initialValues={{
                tenantName: user?.fullName || displayName,
                tenantPhone: '0987654321',
                startDate: '2026-08-01',
                leaseTerm: 12
              }}
            >
              {rentStep === 1 && (
                <div>
                  <AntForm.Item label="Họ và tên người thuê" name="tenantName" rules={[{ required: true, message: 'Nhập họ tên!' }]}>
                    <Input placeholder="Nguyễn Văn A" style={{ borderRadius: 8 }} />
                  </AntForm.Item>
                  <AntForm.Item label="Số điện thoại liên hệ" name="tenantPhone" rules={[{ required: true, message: 'Nhập SĐT!' }]}>
                    <Input placeholder="0987654321" style={{ borderRadius: 8 }} />
                  </AntForm.Item>
                  <Row className="g-2">
                    <Col sm={6} xs={12}>
                      <AntForm.Item label="Ngày chuyển vào" name="startDate" rules={[{ required: true }]}>
                        <Input type="date" style={{ borderRadius: 8 }} />
                      </AntForm.Item>
                    </Col>
                    <Col sm={6} xs={12}>
                      <AntForm.Item label="Thời hạn thuê" name="leaseTerm">
                        <Select style={{ width: '100%' }}>
                          <Select.Option value={3}>3 tháng</Select.Option>
                          <Select.Option value={6}>6 tháng</Select.Option>
                          <Select.Option value={12}>12 tháng</Select.Option>
                          <Select.Option value={24}>24 tháng</Select.Option>
                        </Select>
                      </AntForm.Item>
                    </Col>
                  </Row>
                  <AntForm.Item label="Ghi chú thêm" name="notes">
                    <Input.TextArea placeholder="Yêu cầu dọn dẹp, xem phòng trước..." rows={2} style={{ borderRadius: 8 }} />
                  </AntForm.Item>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                    <Button onClick={() => setIsRentalModalOpen(false)} style={{ borderRadius: 8 }}>Hủy</Button>
                    <Button type="primary" style={{ background: '#ff6b00', borderColor: '#ff6b00', borderRadius: 8 }} onClick={() => setRentStep(2)}>
                      Tiếp theo →
                    </Button>
                  </div>
                </div>
              )}

              {rentStep === 2 && (
                <div>
                  <div style={{ background: '#f9fafb', padding: 16, borderRadius: 12, marginBottom: 16, border: '1px solid #f3f4f6' }}>
                    <h6 style={{ fontWeight: 700, margin: '0 0 10px 0', fontSize: 14 }}>Tóm tắt đăng ký</h6>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: '#6b7280' }}>Phòng đăng ký:</span>
                      <strong>#{selectedRoomForRent?.id} - {selectedRoomForRent?.title}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: '#6b7280' }}>Giá thuê hàng tháng:</span>
                      <strong style={{ color: '#ff4d4f' }}>{Number(selectedRoomForRent?.price).toLocaleString()} đ/tháng</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#6b7280' }}>Tiền cọc ước tính (2 tháng):</span>
                      <strong>{Number((selectedRoomForRent?.price || 0) * 2).toLocaleString()} đ</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 20 }}>
                    <Button onClick={() => setRentStep(1)} style={{ borderRadius: 8 }}>← Quay lại</Button>
                    <Button type="primary" htmlType="submit" style={{ background: '#ff6b00', borderColor: '#ff6b00', borderRadius: 8, fontWeight: 600 }}>
                      🚀 Gửi yêu cầu ngay
                    </Button>
                  </div>
                </div>
              )}
            </AntForm>
          </div>
        )}
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
          <AntForm.Item label="Mật khẩu hiện tại" name="oldPassword" rules={[{ required: true, message: 'Nhập mật khẩu hiện tại!' }]}><Input.Password placeholder="Mặc định: 123456" /></AntForm.Item>
          <AntForm.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, message: 'Nhập mật khẩu mới!' }]}><Input.Password /></AntForm.Item>
          <AntForm.Item label="Xác nhận mật khẩu mới" name="confirmPassword" dependencies={['newPassword']} rules={[{ required: true }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('newPassword') === value) return Promise.resolve(); return Promise.reject(new Error('Mật khẩu không khớp!')); } })]}><Input.Password /></AntForm.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button onClick={() => setIsPasswordModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Xác nhận đổi</Button>
          </div>
        </AntForm>
      </Modal>
    </div>
  );
};

export default Home;