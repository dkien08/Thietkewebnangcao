import React, { useState } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Form, Input, DatePicker, message } from 'antd';
import { Row, Col } from 'react-bootstrap';
import {
  FilePdfOutlined,
  ReloadOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  EyeOutlined,
  DownloadOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const Contracts = () => {
  // --- STATE QUẢN LÝ MODAL ---
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [formRenew] = Form.useForm();
  const [formTerminate] = Form.useForm();

  // Dữ liệu hợp đồng đang hiệu lực
  const activeContract = {
    code: 'HĐ-2026-P101',
    roomName: 'Phòng Studio P101 - Lê Đức Thọ, Nam Từ Liêm',
    startDate: '01/01/2026',
    endDate: '01/01/2027',
    deposit: '4.500.000 đ',
    status: 'Active',
  };

  // Dữ liệu lịch sử hợp đồng cũ
  const contractHistory = [
    {
      key: '1',
      code: 'HĐ-2025-P202',
      roomName: 'Phòng Khép Kín P202',
      duration: '01/01/2025 - 01/01/2026',
      status: 'Terminated',
    },
  ];

  // Render Tag trạng thái
  const renderStatusTag = (status) => {
    switch (status) {
      case 'Active':
        return (
          <Tag icon={<CheckCircleOutlined />} color="success" style={{ borderRadius: 12, padding: '2px 10px' }}>
            Đang hiệu lực
          </Tag>
        );
      case 'Terminated':
        return (
          <Tag icon={<InfoCircleOutlined />} color="default" style={{ borderRadius: 12, padding: '2px 10px' }}>
            Đã thanh lý
          </Tag>
        );
      default:
        return <Tag>{status}</Tag>;
    }
  };

  // Cấu hình bảng Lịch sử hợp đồng
  const columns = [
    {
      title: 'Mã HĐ',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <strong style={{ color: '#1677ff' }}>{text}</strong>,
    },
    {
      title: 'Tên phòng',
      dataIndex: 'roomName',
      key: 'roomName',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Thời hạn',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => renderStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: () => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} style={{ color: '#1677ff' }}>
            Xem
          </Button>
          <Button type="text" icon={<DownloadOutlined />}>
            Tải
          </Button>
        </Space>
      ),
    },
  ];

  // Xử lý gửi yêu cầu gia hạn
  const handleRenewSubmit = (values) => {
    message.success('Đã gửi yêu cầu gia hạn hợp đồng tới chủ nhà!');
    setIsRenewModalOpen(false);
    formRenew.resetFields();
  };

  // Xử lý gửi thỏa thuận chấm dứt
  const handleTerminateSubmit = (values) => {
    message.success('Đã gửi yêu cầu chấm dứt hợp đồng!');
    setIsTerminateModalOpen(false);
    formTerminate.resetFields();
  };

  return (
    <div className="contracts-container">
      <div className="text-muted small mb-3">Bảng điều khiển / Quản lý hợp đồng thuê</div>

      {/* SECTION 1: HỢP ĐỒNG ĐANG HIỆU LỰC */}
      <h5 className="mb-3" style={{ fontWeight: 700, color: '#1e293b' }}>
        📄 HỢP ĐỒNG ĐANG HIỆU LỰC
      </h5>

      <Card className="mb-4 border-0 shadow-sm" bodyStyle={{ padding: 24 }}>
        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <FileTextOutlined style={{ fontSize: 20, color: '#1677ff' }} />
            <h6 className="m-0" style={{ fontWeight: 700, fontSize: 16 }}>
              Mã HĐ: <span style={{ color: '#1677ff' }}>{activeContract.code}</span>
            </h6>
          </div>
          <div>{renderStatusTag(activeContract.status)}</div>
        </div>

        <h6 className="mb-3" style={{ fontWeight: 600 }}>
          {activeContract.roomName}
        </h6>

        {/* Thông tin chi tiết hợp đồng */}
        <Row className="g-3 p-3 mb-3 bg-light rounded align-items-center text-center text-md-start">
          <Col md={4}>
            <span className="text-muted small d-block">Ngày bắt đầu</span>
            <strong>{activeContract.startDate}</strong>
          </Col>
          <Col md={4}>
            <span className="text-muted small d-block">Ngày kết thúc</span>
            <strong>{activeContract.endDate}</strong>
          </Col>
          <Col md={4}>
            <span className="text-muted small d-block">Tiền cọc</span>
            <strong style={{ color: '#52c41a' }}>{activeContract.deposit}</strong>
          </Col>
        </Row>

        {/* Các nút hành động */}
        <Space wrap>
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={() => message.info('Đang tải tệp PDF hợp đồng...')}
          >
            Tải PDF Hợp đồng
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => setIsRenewModalOpen(true)}
          >
            Yêu cầu gia hạn
          </Button>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => setIsTerminateModalOpen(true)}
          >
            Thỏa thuận chấm dứt HĐ
          </Button>
        </Space>
      </Card>

      {/* SECTION 2: LỊCH SỬ HỢP ĐỒNG CŨ */}
      <h5 className="mb-3" style={{ fontWeight: 700, color: '#1e293b' }}>
        📜 LỊCH SỬ HỢP ĐỒNG CŨ
      </h5>

      <Card className="border-0 shadow-sm" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={contractHistory}
          pagination={false}
          rowKey="key"
        />
      </Card>

      {/* 🔄 MODAL YÊU CẦU GIA HẠN */}
      <Modal
        title="🔄 Yêu cầu gia hạn hợp đồng"
        open={isRenewModalOpen}
        onCancel={() => setIsRenewModalOpen(false)}
        footer={null}
      >
        <Form form={formRenew} layout="vertical" onFinish={handleRenewSubmit}>
          <Form.Item label="Thời hạn muốn gia hạn thêm (tháng)" name="months" rules={[{ required: true, message: 'Nhập số tháng!' }]}>
            <Input type="number" placeholder="Ví dụ: 6 hoặc 12" addonAfter="Tháng" />
          </Form.Item>
          <Form.Item label="Ghi chú cho chủ nhà" name="note">
            <Input.TextArea rows={3} placeholder="Ví dụ: Tôi muốn gia hạn thêm 1 năm và giữ nguyên giá cọc..." />
          </Form.Item>
          <Button type="primary" htmlType="submit" block style={{ height: 40 }}>
            Gửi yêu cầu gia hạn
          </Button>
        </Form>
      </Modal>

      {/* ❌ MODAL THỎA THUẬN CHẤM DỨT */}
      <Modal
        title="❌ Thỏa thuận chấm dứt hợp đồng"
        open={isTerminateModalOpen}
        onCancel={() => setIsTerminateModalOpen(false)}
        footer={null}
      >
        <Form form={formTerminate} layout="vertical" onFinish={handleTerminateSubmit}>
          <Form.Item label="Ngày dự kiến trả phòng" name="endDate" rules={[{ required: true, message: 'Chọn ngày trả phòng!' }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
          </Form.Item>
          <Form.Item label="Lý do chấm dứt" name="reason" rules={[{ required: true, message: 'Nhập lý do!' }]}>
            <Input.TextArea rows={3} placeholder="Ví dụ: Thay đổi nơi làm việc, chuyển công tác..." />
          </Form.Item>
          <Button type="primary" danger htmlType="submit" block style={{ height: 40 }}>
            Gửi yêu cầu chấm dứt
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default Contracts;