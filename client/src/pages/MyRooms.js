import React, { useState, useEffect } from 'react';
import { Row, Col, Form as BsForm } from 'react-bootstrap';
import {
  Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space, message, Popconfirm, Card, Upload
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, PictureOutlined, ToolOutlined, CheckCircleOutlined, UploadOutlined
} from '@ant-design/icons';
import { roomApi } from './roomApi'; // Import module Axios Client đã viết

const MyRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // States cho Quản lý ảnh (F19 & F20)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedRoomForImages, setSelectedRoomForImages] = useState(null);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [form] = Form.useForm();

  // 🔄 F11: Lấy danh sách phòng thuộc chủ nhà từ Backend NestJS
  const fetchMyRooms = async () => {
    setLoading(true);
    try {
      const res = await roomApi.getLandlordRooms();
      setRooms(res.data || []);
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể tải danh sách phòng trọ!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRooms();
  }, []);

  // 🟢 Mở Modal Đăng bài / Chỉnh sửa
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

  // 🟢 F10 & F12: Submit Form Thêm/Sửa bài đăng
  const handleSubmitForm = async (values) => {
    try {
      if (editingRoom) {
        // F12: Cập nhật thông tin phòng / chuyển trạng thái bảo trì
        await roomApi.updateRoom(editingRoom.id, values);
        message.success(`[F12] Cập nhật thông tin phòng #${editingRoom.id} thành công!`);
      } else {
        // F10: Đăng bài phòng trọ mới
        await roomApi.createRoom(values);
        message.success('[F10] Tạo thành công phòng trọ mới!');
      }
      setIsModalOpen(false);
      fetchMyRooms(); // Refresh lại danh sách
    } catch (error) {
      message.error(error.response?.data?.message || 'Thao tác thất bại!');
    }
  };

  // 🔴 F13: Xóa phòng trọ
  const handleDeleteRoom = async (roomId) => {
    try {
      await roomApi.deleteRoom(roomId);
      message.success(`[F13] Đã xóa bài đăng phòng #${roomId}!`);
      fetchMyRooms();
    } catch (error) {
      message.error('Không thể xóa bài đăng này!');
    }
  };

  // 🖼️ Mở Modal Quản lý bộ sưu tập ảnh
  const handleOpenImageModal = (room) => {
    setSelectedRoomForImages(room);
    setIsImageModalOpen(true);
  };

  // 🟢 F19: Thêm ảnh bằng URL
  const handleAddImageByUrl = async () => {
    if (!newImageUrl.trim()) {
      message.error('Vui lòng nhập đường dẫn URL hình ảnh!');
      return;
    }
    try {
      await roomApi.uploadRoomImage(selectedRoomForImages.id, { imageUrl: newImageUrl.trim() });
      message.success('[F19] Thêm ảnh mới thành công!');
      setNewImageUrl('');
      fetchMyRooms();
      setIsImageModalOpen(false);
    } catch (error) {
      message.error('Lỗi khi tải ảnh lên!');
    }
  };

  // 🔴 F20: Xóa lẻ ảnh
  const handleDeleteImage = async (imageId) => {
    try {
      await roomApi.deleteRoomImage(selectedRoomForImages.id, imageId);
      message.success('[F20] Đã xóa ảnh khỏi danh sách!');
      fetchMyRooms();
      setIsImageModalOpen(false);
    } catch (error) {
      message.error('Xóa ảnh thất bại!');
    }
  };

  // Cấu hình Bảng (Table Columns)
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
        title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>🏢 Quản lý danh sách bài đăng phòng trọ</span>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAddModal}>
            Đăng phòng mới (F10)
          </Button>
        }
        className="shadow-sm border-0"
      >
        <Table columns={columns} dataSource={rooms} rowKey="id" loading={loading} pagination={{ pageSize: 5 }} />
      </Card>

      {/* 📝 MODAL THÊM MỚI (F10) HOẶC CẬP NHẬT (F12) */}
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

          <Row className="g-2">
            <Col md={6}>
              <Form.Item
                label="Quận / Huyện"
                name="district"
                rules={[{ required: true, message: 'Nhập Quận/Huyện!' }]}
              >
                <Input placeholder="Ví dụ: Nam Từ Liêm" />
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

          <Row className="g-2">
            <Col md={6}>
              <Form.Item
                label="Giá thuê (đ/tháng)"
                name="price"
                rules={[
                  { required: true, message: 'Nhập giá thuê!' },
                  { type: 'number', min: 1, message: 'Giá phải lớn hơn 0!' }
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

          <Row className="g-2">
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

          <div className="d-flex justify-content-end gap-2 mt-3">
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
        <div className="mb-3 p-3 bg-light rounded">
          <h6 className="fw-bold">F19: Thêm ảnh phòng mới (Image URL)</h6>
          <div className="d-flex gap-2">
            <Input
              placeholder="Dán URL ảnh từ Cloudinary..."
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddImageByUrl}>
              Thêm
            </Button>
          </div>
        </div>

        {/* F20: Danh sách ảnh hiện tại & Xóa */}
        <h6 className="fw-bold">F20: Danh sách ảnh hiện tại ({selectedRoomForImages?.images?.length || 0})</h6>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 10 }}>
          {selectedRoomForImages?.images?.map((img) => (
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