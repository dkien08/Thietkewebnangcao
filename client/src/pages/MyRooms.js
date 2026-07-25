import React, { useState } from 'react';
import { Row, Col, Form as BsForm } from 'react-bootstrap';
import {
  Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space, message, Popconfirm, Card
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, PictureOutlined, ToolOutlined, CheckCircleOutlined
} from '@ant-design/icons';

// F11: Danh sách phòng ban đầu của Chủ nhà
const INITIAL_MY_ROOMS = [
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
    description: 'Phòng studio đầy đủ đồ, ban công thoáng mát.',
    images: [
      { id: 1, url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=80' }
    ]
  },
  {
    id: 'P202',
    title: 'Căn hộ Mini 1PN Cầu Giấy',
    addressDetail: '45 Chùa Bộc',
    district: 'Cầu Giấy',
    price: 5200000,
    area: 35,
    hasAc: true,
    hasWm: false,
    status: 'AVAILABLE',
    description: 'Cạnh các trường đại học lớn, giờ giấc tự do.',
    images: [
      { id: 2, url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=500&q=80' }
    ]
  }
];

const MyRooms = () => {
  const [rooms, setRooms] = useState(INITIAL_MY_ROOMS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // States cho F19 & F20 (Quản lý ảnh)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedRoomForImages, setSelectedRoomForImages] = useState(null);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [form] = Form.useForm();

  // 🟢 BẬT MODAL THÊM / SỬA PHÒNG
  const handleOpenAddModal = () => {
    setEditingRoom(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record) => {
    setEditingRoom(record);
    form.setFieldsValue({
      ...record,
      price: record.price,
      area: record.area
    });
    setIsModalOpen(true);
  };

  // 🟢 F10 & F12: LƯU PHÒNG TRỌ (THÊM MỚI HẶC CẬP NHẬT)
  const handleSubmitForm = (values) => {
    if (editingRoom) {
      // F12: PUT /api/rooms/:id - Cập nhật thông tin / trạng thái bảo trì
      const updatedRooms = rooms.map((room) =>
        room.id === editingRoom.id ? { ...room, ...values } : room
      );
      setRooms(updatedRooms);
      message.success(`[F12] Đã cập nhật thông tin phòng #${editingRoom.id}!`);
    } else {
      // F10: POST /api/rooms - Thêm phòng trọ mới
      const newRoom = {
        id: `P${Math.floor(100 + Math.random() * 900)}`,
        ...values,
        status: 'AVAILABLE', // Trạng thái mặc định là AVAILABLE theo SRS
        images: [
          {
            id: Date.now(),
            url: values.firstImageUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=80'
          }
        ]
      };
      setRooms([newRoom, ...rooms]);
      message.success(`[F10] Đã tạo thành công phòng trọ mới #${newRoom.id}!`);
    }
    setIsModalOpen(false);
  };

  // 🔴 F13: DELETE /api/rooms/:id - XÓA PHÒNG TRỌ
  const handleDeleteRoom = (roomId) => {
    const updatedRooms = rooms.filter((r) => r.id !== roomId);
    setRooms(updatedRooms);
    message.success(`[F13] Đã xóa bài đăng phòng #${roomId} và các dữ liệu ảnh liên quan!`);
  };

  // 🖼️ F19 & F20: BẬT MODAL QUẢN LÝ ẢNH
  const handleOpenImageModal = (room) => {
    setSelectedRoomForImages(room);
    setIsImageModalOpen(true);
  };

  // 🟢 F19: POST /api/rooms/:id/images - THÊM ẢNH BÀI ĐĂNG
  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      message.error('Vui lòng nhập đường dẫn URL hình ảnh!');
      return;
    }
    const newImageObj = { id: Date.now(), url: newImageUrl.trim() };
    const updatedRooms = rooms.map((r) => {
      if (r.id === selectedRoomForImages.id) {
        return { ...r, images: [...r.images, newImageObj] };
      }
      return r;
    });

    setRooms(updatedRooms);
    setSelectedRoomForImages({
      ...selectedRoomForImages,
      images: [...selectedRoomForImages.images, newImageObj]
    });
    setNewImageUrl('');
    message.success('[F19] Thêm ảnh mới vào bộ sưu tập thành công!');
  };

  // 🔴 F20: DELETE /api/rooms/:roomId/images/:imageId - XÓA ẢNH
  const handleDeleteImage = (imageId) => {
    const updatedImages = selectedRoomForImages.images.filter((img) => img.id !== imageId);
    const updatedRooms = rooms.map((r) => {
      if (r.id === selectedRoomForImages.id) {
        return { ...r, images: updatedImages };
      }
      return r;
    });

    setRooms(updatedRooms);
    setSelectedRoomForImages({ ...selectedRoomForImages, images: updatedImages });
    message.success('[F20] Đã xóa ảnh khỏi phòng trọ!');
  };

  // Cấu hình các cột cho Bảng Quản lý phòng (Table)
  const columns = [
    {
      title: 'Mã & Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <span style={{ fontWeight: 'bold', color: '#1677ff' }}>#{record.id}</span> - {text}
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>📍 {record.addressDetail}, {record.district}</div>
        </div>
      )
    },
    {
      title: 'Giá thuê',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <strong style={{ color: '#ff4d4f' }}>{Number(price).toLocaleString()} đ</strong>
    },
    {
      title: 'Diện tích',
      dataIndex: 'area',
      key: 'area',
      render: (area) => `${area} m²`
    },
    {
      title: 'Tiện ích',
      key: 'amenities',
      render: (_, record) => (
        <Space size={[0, 4]} wrap>
          {record.hasAc && <Tag color="blue">Điều hòa / Wifi</Tag>}
          {record.hasWm && <Tag color="green">Máy giặt</Tag>}
        </Space>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'AVAILABLE') return <Tag icon={<CheckCircleOutlined />} color="success">Sẵn sàng</Tag>;
        if (status === 'RENTED') return <Tag color="processing">Đã cho thuê</Tag>;
        if (status === 'MAINTENANCE') return <Tag icon={<ToolOutlined />} color="warning">Bảo trì</Tag>;
        return <Tag>{status}</Tag>;
      }
    },
    {
      title: 'Ảnh bài đăng',
      key: 'imagesCount',
      render: (_, record) => (
        <Button
          type="dashed"
          size="small"
          icon={<PictureOutlined />}
          onClick={() => handleOpenImageModal(record)}
        >
          Quản lý ({record.images?.length || 0})
        </Button>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#1677ff' }} />}
            onClick={() => handleOpenEditModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa bài đăng phòng"
            description="Bạn có chắc chắn muốn xóa phòng này không?"
            onConfirm={() => handleDeleteRoom(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card
        title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>🏢 F11: Danh sách bài đăng & Quản lý phòng trọ</span>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAddModal}>
            Đăng phòng mới (F10)
          </Button>
        }
        className="shadow-sm border-0"
      >
        <Table columns={columns} dataSource={rooms} rowKey="id" pagination={{ pageSize: 5 }} />
      </Card>

      {/* 📝 MODAL THÊM MỚI (F10) HOẶC CẬP NHẬT (F12) PHÒNG TRỌ */}
      <Modal
        title={editingRoom ? `✏️ F12: Chỉnh sửa phòng #${editingRoom.id}` : '➕ F10: Đăng bài phòng trọ mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitForm}>
          <Form.Item
            label="Tiêu đề bài đăng"
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề phòng!' }]}
          >
            <Input placeholder="Ví dụ: Studio Lê Đức Thọ Full Nội Thất" />
          </Form.Item>

          <Row spacing={10}>
            <Col md={6}>
              <Form.Item
                label="Quận / Huyện"
                name="district"
                rules={[{ required: true, message: 'Nhập Quận/Huyện!' }]}
              >
                <Input placeholder="Ví dụ: Cầu Giấy" />
              </Form.Item>
            </Col>
            <Col md={6}>
              <Form.Item
                label="Địa chỉ chi tiết"
                name="addressDetail"
                rules={[{ required: true, message: 'Nhập địa chỉ!' }]}
              >
                <Input placeholder="Ví dụ: 121 Lê Đức Thọ" />
              </Form.Item>
            </Col>
          </Row>

          <Row spacing={10}>
            <Col md={6}>
              <Form.Item
                label="Giá thuê (đ/tháng)"
                name="price"
                rules={[
                  { required: true, message: 'Nhập giá thuê!' },
                  { type: 'number', min: 1, message: 'Giá thuê phải lớn hơn 0!' }
                ]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="4500000" />
              </Form.Item>
            </Col>
            <Col md={6}>
              <Form.Item
                label="Diện tích (m²)"
                name="area"
                rules={[
                  { required: true, message: 'Nhập diện tích!' },
                  { type: 'number', min: 1, message: 'Diện tích phải lớn hơn 0!' }
                ]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="28" />
              </Form.Item>
            </Col>
          </Row>

          {editingRoom && (
            <Form.Item label="Trạng thái phòng" name="status">
              <Select options={[
                { value: 'AVAILABLE', label: '🟢 Sẵn sàng (Available)' },
                { value: 'RENTED', label: '🔵 Đã cho thuê (Rented)' },
                { value: 'MAINTENANCE', label: '🟡 Đang bảo trì (Maintenance)' }
              ]} />
            </Form.Item>
          )}

          {!editingRoom && (
            <Form.Item label="URL Ảnh đại diện ban đầu" name="firstImageUrl">
              <Input placeholder="Dán đường dẫn link ảnh từ Cloudinary/Internet..." />
            </Form.Item>
          )}

          <Row spacing={10}>
            <Col md={6}>
              <Form.Item name="hasAc" valuePropName="checked">
                <BsForm.Check type="checkbox" id="ac-modal" label="Có Điều hòa / Wifi" />
              </Form.Item>
            </Col>
            <Col md={6}>
              <Form.Item name="hasWm" valuePropName="checked">
                <BsForm.Check type="checkbox" id="wm-modal" label="Có Máy giặt" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mô tả chi tiết" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả về giờ giấc, tiện ích xung quanh..." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              {editingRoom ? 'Lưu cập nhật (F12)' : 'Tạo bài đăng (F10)'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* 🖼️ MODAL QUẢN LÝ ÁNH BÀI ĐĂNG (F19 & F20) */}
      <Modal
        title={`🖼️ Quản lý ảnh bài đăng - #${selectedRoomForImages?.id}`}
        open={isImageModalOpen}
        onCancel={() => setIsImageModalOpen(false)}
        footer={null}
      >
        {/* F19: Thêm ảnh mới */}
        <div style={{ marginBottom: 20, padding: 15, background: '#f5f5f5', borderRadius: 8 }}>
          <h6 style={{ fontWeight: 'bold' }}>F19: Thêm ảnh phòng mới (Cloudinary URL)</h6>
          <div style={{ display: 'flex', gap: 10 }}>
            <Input
              placeholder="Dán URL ảnh mới..."
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddImage}>
              Thêm
            </Button>
          </div>
        </div>

        {/* F20: Danh sách ảnh & Xóa */}
        <h6 style={{ fontWeight: 'bold' }}>F20: Danh sách ảnh hiện tại ({selectedRoomForImages?.images?.length || 0})</h6>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 10 }}>
          {selectedRoomForImages?.images.map((img) => (
            <div key={img.id} style={{ position: 'relative', border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}>
              <img src={img.url} alt="Room" style={{ width: '100%', height: 90, objectFit: 'cover' }} />
              <Popconfirm
                title="Xóa ảnh này?"
                onConfirm={() => handleDeleteImage(img.id)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button
                  shape="circle"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  style={{ position: 'absolute', top: 4, right: 4 }}
                />
              </Popconfirm>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default MyRooms;