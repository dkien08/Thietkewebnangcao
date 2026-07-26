import React, { useState, useEffect } from 'react';
import { Row, Col, Form as BsForm } from 'react-bootstrap';
import {
  Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space, message, Popconfirm, Card, DatePicker
} from 'antd';
import {
  PlusOutlined, EditOutlined, FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, StopOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { contractApi } from './contractApi'; // Import API hợp đồng đã tạo
import { roomApi } from './roomApi';         // Import roomApi để lấy danh sách phòng sẵn sàng

const Contracts = () => {
  const [contracts, setContracts] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);

  const [form] = Form.useForm();

  // 🔄 F14: Lấy danh sách hợp đồng của Chủ nhà từ Backend
  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await contractApi.getLandlordContracts();
      setContracts(res.data || []);
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể tải danh sách hợp đồng!');
    } finally {
      setLoading(false);
    }
  };

  // 🏠 Lấy danh sách các phòng đang SẴN SÀNG (AVAILABLE) để tạo hợp đồng mới
  const fetchAvailableRooms = async () => {
    try {
      const res = await roomApi.getLandlordRooms();
      const rooms = res.data || [];
      // Lọc các phòng chưa có người thuê
      setAvailableRooms(rooms.filter(r => r.status === 'AVAILABLE'));
    } catch (error) {
      console.error('Lỗi lấy danh sách phòng trống:', error);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // 🟢 Bật Modal Tạo Hợp Đồng (F15)
  const handleOpenAddModal = () => {
    setEditingContract(null);
    form.resetFields();
    fetchAvailableRooms(); // Load phòng trống khi mở modal
    setIsModalOpen(true);
  };

  // ✏️ Bật Modal Chỉnh sửa / Cập nhật trạng thái Hợp Đồng (F16)
  const handleOpenEditModal = (record) => {
    setEditingContract(record);
    form.setFieldsValue({
      ...record,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null,
    });
    setIsModalOpen(true);
  };

  // 🟢 F15 & F16: Submit Form Hợp đồng
  const handleSubmitForm = async (values) => {
    try {
      const formattedValues = {
        ...values,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
      };

      if (editingContract) {
        // F16: Cập nhật thông tin / trạng thái hợp đồng
        await contractApi.updateContract(editingContract.id, formattedValues);
        message.success(`[F16] Cập nhật hợp đồng #${editingContract.id} thành công!`);
      } else {
        // F15: Lập hợp đồng thuê mới
        await contractApi.createContract(formattedValues);
        message.success('[F15] Lập hợp đồng mới thành công!');
      }
      setIsModalOpen(false);
      fetchContracts(); // Refresh lại dữ liệu
    } catch (error) {
      message.error(error.response?.data?.message || 'Thao tác thất bại!');
    }
  };

  // 🔴 F18: Thanh lý / Kết thúc hợp đồng trước hạn
  const handleTerminateContract = async (contractId) => {
    try {
      await contractApi.terminateContract(contractId);
      message.success(`[F18] Đã thanh lý hợp đồng #${contractId}! Phong trọ đã được chuyển về trạng thái Sẵn sàng.`);
      fetchContracts();
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể thanh lý hợp đồng này!');
    }
  };

  // 🎨 Cấu hình hiển thị cột trong Table
  const columns = [
    {
      title: 'Mã HĐ',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <strong style={{ color: '#1677ff' }}>#{id}</strong>
    },
    {
      title: 'Phòng trọ',
      key: 'room',
      render: (_, record) => (
        <div>
          <div className="fw-bold">{record.room?.title || `Phòng #${record.roomId}`}</div>
          <small className="text-muted">📍 {record.room?.addressDetail}</small>
        </div>
      )
    },
    {
      title: 'Khách thuê',
      key: 'tenant',
      render: (_, record) => (
        <div>
          <div>👤 {record.tenant?.fullName || record.tenantName || 'N/A'}</div>
          <small className="text-muted">📞 {record.tenant?.phone || record.tenantPhone || 'N/A'}</small>
        </div>
      )
    },
    {
      title: 'Giá thuê & Cọc',
      key: 'financials',
      render: (_, record) => (
        <div>
          <div>Giá: <strong className="text-danger">{Number(record.monthlyPrice || record.room?.price || 0).toLocaleString()} đ</strong></div>
          <small className="text-muted">Cọc: {Number(record.depositAmount || 0).toLocaleString()} đ</small>
        </div>
      )
    },
    {
      title: 'Thời hạn hợp đồng',
      key: 'duration',
      render: (_, record) => (
        <div style={{ fontSize: '13px' }}>
          <div>📅 Từ: {record.startDate ? dayjs(record.startDate).format('DD/MM/YYYY') : 'N/A'}</div>
          <div>📅 Đến: {record.endDate ? dayjs(record.endDate).format('DD/MM/YYYY') : 'N/A'}</div>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'ACTIVE') return <Tag icon={<CheckCircleOutlined />} color="success">Đang hiệu lực</Tag>;
        if (status === 'PENDING') return <Tag icon={<ClockCircleOutlined />} color="warning">Chờ duyệt</Tag>;
        if (status === 'EXPIRED') return <Tag icon={<StopOutlined />} color="default">Đã hết hạn</Tag>;
        if (status === 'CANCELLED') return <Tag icon={<CloseCircleOutlined />} color="error">Đã hủy/Thanh lý</Tag>;
        return <Tag>{status}</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#1677ff' }} />}
            onClick={() => handleOpenEditModal(record)}
          >
            Sửa
          </Button>

          {record.status === 'ACTIVE' && (
            <Popconfirm
              title="Thanh lý hợp đồng"
              description="Bạn có chắc chắn muốn kết thúc hợp đồng này trước thời hạn?"
              onConfirm={() => handleTerminateContract(record.id)}
              okText="Thanh lý"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<StopOutlined />}>
                Thanh lý (F18)
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card
        title={
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
            📜 Quản lý Hợp đồng Thuê nhà (F14)
          </span>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAddModal}>
            Lập hợp đồng mới (F15)
          </Button>
        }
        className="shadow-sm border-0"
      >
        <Table
          columns={columns}
          dataSource={contracts}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      {/* 📝 MODAL LẬP MỚI (F15) HOẶC CẬP NHẬT (F16) HỢP ĐỒNG */}
      <Modal
        title={
          editingContract
            ? `✏️ F16: Cập nhật Hợp đồng #${editingContract.id}`
            : '➕ F15: Lập Hợp đồng Thuê nhà Mới'
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
        width={650}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitForm}>
          {!editingContract ? (
            <Form.Item
              label="Chọn Phòng trọ (Chỉ phòng đang trống)"
              name="roomId"
              rules={[{ required: true, message: 'Vui lòng chọn phòng trọ!' }]}
            >
              <Select
                placeholder="--- Chọn phòng trọ ---"
                options={availableRooms.map(r => ({
                  value: r.id,
                  label: `#${r.id} - ${r.title} (${Number(r.price).toLocaleString()} đ/tháng)`
                }))}
              />
            </Form.Item>
          ) : (
            <div className="mb-3 p-2 bg-light rounded">
              <strong>Phòng đang thuê:</strong> #{editingContract.roomId} - {editingContract.room?.title}
            </div>
          )}

          <Row className="g-2">
            <Col md={6}>
              <Form.Item
                label="Mã Khách thuê (Tenant ID)"
                name="tenantId"
                rules={[{ required: true, message: 'Nhập ID khách thuê!' }]}
              >
                <Input placeholder="Ví dụ: 2 (ID tài khoản khách)" />
              </Form.Item>
            </Col>

            <Col md={6}>
              <Form.Item
                label="Số tiền đặt cọc (VNĐ)"
                name="depositAmount"
                rules={[{ required: true, message: 'Nhập số tiền cọc!' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="5000000" />
              </Form.Item>
            </Col>
          </Row>

          <Row className="g-2">
            <Col md={6}>
              <Form.Item
                label="Giá thuê thỏa thuận (VNĐ/tháng)"
                name="monthlyPrice"
                rules={[{ required: true, message: 'Nhập giá thuê hàng tháng!' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="4500000" />
              </Form.Item>
            </Col>

            <Col md={6}>
              {editingContract && (
                <Form.Item
                  label="Trạng thái Hợp đồng"
                  name="status"
                  rules={[{ required: true, message: 'Chọn trạng thái!' }]}
                >
                  <Select options={[
                    { value: 'ACTIVE', label: '🟢 Đang hiệu lực (ACTIVE)' },
                    { value: 'PENDING', label: '🟡 Chờ xác nhận (PENDING)' },
                    { value: 'EXPIRED', label: '⚪ Đã hết hạn (EXPIRED)' },
                    { value: 'CANCELLED', label: '🔴 Đã hủy/Thanh lý (CANCELLED)' },
                  ]} />
                </Form.Item>
              )}
            </Col>
          </Row>

          <Row className="g-2">
            <Col md={6}>
              <Form.Item
                label="Ngày bắt đầu"
                name="startDate"
                rules={[{ required: true, message: 'Chọn ngày bắt đầu!' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
              </Form.Item>
            </Col>

            <Col md={6}>
              <Form.Item
                label="Ngày kết thúc"
                name="endDate"
                rules={[{ required: true, message: 'Chọn ngày kết thúc!' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Điều khoản bổ sung / Ghi chú" name="terms">
            <Input.TextArea rows={3} placeholder="Ghi chú về đóng tiền điện nước, quy định bồi thường..." />
          </Form.Item>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              {editingContract ? 'Lưu cập nhật (F16)' : 'Lập hợp đồng (F15)'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Contracts;