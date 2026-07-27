// client/src/pages/MyRoom.jsx
import React, { useEffect, useState } from 'react';
import { Card, Badge, Button, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { 
  HomeOutlined, UserOutlined, PhoneOutlined, 
  ClockCircleOutlined, CheckCircleOutlined, StopOutlined, FileTextOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const MyRoom = () => {
  const navigate = useNavigate();
  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tải thông tin Hợp đồng & Phòng đang thuê
  const fetchMyActiveContract = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/contracts/my-active');
      const data = res.data?.data || res.data || null;
      setContractData(data);
    } catch (err) {
      console.error('Lỗi khi tải thông tin phòng:', err);
      setError('Khởi tạo dữ liệu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyActiveContract();
  }, []);

  // Hủy yêu cầu thuê (Khi PENDING)
  const handleCancelRequest = async (contractId) => {
    if (!window.confirm('Bạn có chắc chắn muốn HỦY yêu cầu thuê phòng này?')) return;
    try {
      await axiosClient.put(`/contracts/${contractId}/reject`);
      alert('Đã hủy yêu cầu thuê phòng.');
      fetchMyActiveContract();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi hủy yêu cầu.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Đang kiểm tra thông tin phòng trọ của bạn...</p>
      </div>
    );
  }

  // =========================================================================
  // TRẠNG THÁI 1: CHƯA ĐĂNG KÝ THUÊ PHÒNG NÀO
  // =========================================================================
  if (!contractData) {
    return (
      <Container className="py-5 text-center">
        <Card className="p-5 shadow-sm border-0 bg-light">
          <HomeOutlined style={{ fontSize: '48px', color: '#94a3b8' }} />
          <h4 className="mt-3 font-weight-bold">Bạn chưa thuê phòng trọ nào</h4>
          <p className="text-muted">Hãy khám phá danh sách phòng trọ còn trống và đăng ký thuê ngay hôm nay!</p>
          <div className="mt-3">
            <Button variant="primary" size="lg" onClick={() => navigate('/')}>
              Tìm phòng trọ ngay
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  const { status, room, landlord } = contractData;
  const statusUpper = String(status || '').toUpperCase();

  return (
    <Container className="py-4">
      {error && <Alert variant="danger">{error}</Alert>}

      {/* ========================================================================= */}
      {/* TRẠNG THÁI 2: ĐÃ GỬI YÊU CẦU - CHỜ CHỦ NHÀ DUYỆT (PENDING) */}
      {/* ========================================================================= */}
      {statusUpper === 'PENDING' && (
        <Card className="shadow-sm border-0 border-top border-warning border-4">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center mb-3">
              <ClockCircleOutlined style={{ fontSize: '28px', color: '#f59e0b', marginRight: '12px' }} />
              <div>
                <h5 className="mb-0 font-weight-bold">Yêu cầu thuê phòng đang chờ phê duyệt</h5>
                <small className="text-muted">Mã yêu cầu: #{contractData.id}</small>
              </div>
              <Badge bg="warning" className="ms-auto fs-6 text-dark">Chờ duyệt</Badge>
            </div>

            <Alert variant="warning" className="mb-4">
              Yêu cầu thuê của bạn đã được gửi tới Chủ nhà. Vui lòng chờ phản hồi hoặc liên hệ trực tiếp với chủ nhà theo thông tin bên dưới.
            </Alert>

            <Row className="g-3">
              <Col md={6}>
                <Card className="bg-light border-0 p-3">
                  <h6 className="fw-bold text-primary mb-2"><HomeOutlined /> Thông tin phòng trọ đăng ký</h6>
                  <p className="mb-1"><strong>Tiêu đề:</strong> {room?.title || 'Phòng trọ'}</p>
                  <p className="mb-1"><strong>Địa chỉ:</strong> {room?.addressDetail || room?.district}</p>
                  <p className="mb-0"><strong>Giá thuê đề xuất:</strong> <span className="text-danger fw-bold">{Number(contractData.price || room?.price || 0).toLocaleString('vi-VN')} đ/tháng</span></p>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="bg-light border-0 p-3">
                  <h6 className="fw-bold text-success mb-2"><UserOutlined /> Thông tin Chủ nhà</h6>
                  <p className="mb-1"><strong>Chủ nhà:</strong> {landlord?.username || room?.landlord?.username || 'Chưa cập nhật'}</p>
                  <p className="mb-0"><strong>SĐT liên hệ:</strong> <PhoneOutlined /> {landlord?.phone || room?.landlord?.phone || 'Chưa cập nhật'}</p>
                </Card>
              </Col>
            </Row>

            <div className="mt-4 text-end">
              <Button variant="outline-danger" onClick={() => handleCancelRequest(contractData.id)}>
                <StopOutlined /> Hủy yêu cầu thuê
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TRẠNG THÁI 3: CHỦ NHÀ ĐÃ DUYỆT - ĐANG THUÊ CHÍNH THỨC (ACTIVE) */}
      {/* ========================================================================= */}
      {statusUpper === 'ACTIVE' && (
        <Card className="shadow-sm border-0 border-top border-success border-4">
          <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0 font-weight-bold text-success">
                <CheckCircleOutlined className="me-2" /> Phòng trọ đang thuê
              </h5>
              <small className="text-muted">Hợp đồng có hiệu lực • Mã HĐ: #{contractData.id}</small>
            </div>
            <Badge bg="success" className="fs-6">Đang hiệu lực</Badge>
          </Card.Header>

          <Card.Body className="p-4">
            <Row className="g-4">
              {/* Cột trái: Thông tin phòng trọ */}
              <Col md={7}>
                <h6 className="fw-bold text-dark border-bottom pb-2">Chi tiết không gian ở</h6>
                <h4 className="fw-bold text-primary mb-2">{room?.title}</h4>
                <p className="text-muted mb-3"><HomeOutlined /> Địa chỉ: {room?.addressDetail}, {room?.district}</p>

                <Row className="mb-3 text-center g-2">
                  <Col xs={4}>
                    <div className="p-2 border rounded bg-light">
                      <small className="text-muted d-block">Giá thuê</small>
                      <strong className="text-danger">{Number(contractData.price || room?.price || 0).toLocaleString('vi-VN')} đ</strong>
                    </div>
                  </Col>
                  <Col xs={4}>
                    <div className="p-2 border rounded bg-light">
                      <small className="text-muted d-block">Diện tích</small>
                      <strong>{room?.area || '--'} m²</strong>
                    </div>
                  </Col>
                  <Col xs={4}>
                    <div className="p-2 border rounded bg-light">
                      <small className="text-muted d-block">Trạng thái</small>
                      <strong className="text-success">Đã bàn giao</strong>
                    </div>
                  </Col>
                </Row>

                {room?.description && (
                  <div className="p-3 bg-light rounded">
                    <small className="fw-bold text-muted d-block mb-1">Mô tả / Nội quy phòng:</small>
                    <p className="small mb-0 text-secondary">{room.description}</p>
                  </div>
                )}
              </Col>

              {/* Cột phải: Thông tin Chủ nhà & Điều khoản */}
              <Col md={5}>
                <div className="p-3 border rounded mb-3 bg-light">
                  <h6 className="fw-bold text-dark mb-3"><UserOutlined /> Thông tin chủ cho thuê</h6>
                  <p className="mb-2"><strong>Họ tên:</strong> {landlord?.username || room?.landlord?.username || 'Chủ nhà'}</p>
                  <p className="mb-2"><strong>Số điện thoại:</strong> {landlord?.phone || room?.landlord?.phone || 'Chưa cập nhật'}</p>
                  <p className="mb-0"><strong>Email:</strong> {landlord?.email || room?.landlord?.email || 'N/A'}</p>
                </div>

                <div className="p-3 border rounded bg-light">
                  <h6 className="fw-bold text-dark mb-2"><FileTextOutlined /> Thời hạn hợp đồng</h6>
                  <p className="small text-muted mb-0">Hợp đồng bắt đầu từ ngày phê duyệt. Để trả phòng hoặc chấm dứt hợp đồng sớm, vui lòng liên hệ trực tiếp với Chủ nhà.</p>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default MyRoom;