// client/src/pages/Contracts.js
import React, { useEffect, useState } from 'react';
import { Container, Table, Badge, Button, Spinner, Alert, Modal, Tag } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { contractApi } from '../api/contractApi';
import { userApi } from '../api/userApi';

const Contracts = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userMode, setUserMode] = useState('Tenant');

  const loadContracts = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Lấy thông tin user hiện tại
      const userRes = await userApi.getProfile();
      const userData = userRes.data || userRes;
      const currentMode = userData.currentMode || userData.role || 'Tenant';
      setUserMode(currentMode);

      // 2. Gọi đúng API tương ứng với Mode
      let res;
      if (currentMode === 'Landlord') {
        res = await contractApi.getLandlordContracts(); // F14
      } else {
        res = await contractApi.getTenantContracts(); // F09
      }

      setContracts(res.data || res || []);
    } catch (err) {
      console.error('Lỗi tải danh sách hợp đồng:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách hợp đồng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  // Xử lý Phê duyệt Hợp đồng (Dành cho Landlord)
  const handleApprove = async (contractId) => {
    try {
      await contractApi.approveContract(contractId);
      alert('Đã phê duyệt yêu cầu thuê phòng thành công!');
      loadContracts(); // Tải lại danh sách
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể duyệt hợp đồng này.');
    }
  };

  // Xử lý Từ chối Hợp đồng (Dành cho Landlord)
  const handleReject = async (contractId) => {
    try {
      await contractApi.rejectContract(contractId);
      alert('Đã từ chối yêu cầu thuê.');
      loadContracts();
    } catch (err) {
      alert(err.response?.data?.message || 'Thao tác thất bại.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <Badge bg="success">Đã duyệt (Active)</Badge>;
      case 'Pending':
        return <Badge bg="warning" text="dark">Chờ duyệt (Pending)</Badge>;
      case 'Rejected':
        return <Badge bg="danger">Đã từ chối (Rejected)</Badge>;
      case 'Terminated':
        return <Badge bg="secondary">Đã kết thúc</Badge>;
      default:
        return <Badge bg="info">{status}</Badge>;
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3> Quản Lý Hợp Đồng & Yêu Cầu Thuê</h3>
          <small className="text-muted">
            Chế độ hiện tại: <strong>{userMode === 'Landlord' ? 'Chủ nhà' : 'Người thuê'}</strong>
          </small>
        </div>
        <Button variant="outline-secondary" onClick={() => navigate(userMode === 'Landlord' ? '/landlord' : '/')}>
          Quay lại
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-2 text-muted">Đang tải danh sách hợp đồng...</p>
        </div>
      ) : (
        <Table striped bordered hover responsive className="align-middle shadow-sm bg-white">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Tên phòng trọ</th>
              <th>{userMode === 'Landlord' ? 'Người gửi yêu cầu (Tenant)' : 'Giá thuê'}</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Trạng thái</th>
              {userMode === 'Landlord' && <th>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {contracts.length === 0 ? (
              <tr>
                <td colSpan={userMode === 'Landlord' ? 7 : 6} className="text-center py-4 text-muted">
                  Chưa có hợp đồng hoặc yêu cầu thuê nào.
                </td>
              </tr>
            ) : (
              contracts.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td><strong>{item.room?.title || `Phòng #${item.roomId}`}</strong></td>
                  <td>
                    {userMode === 'Landlord'
                      ? item.tenant?.username || `ID Tenant: ${item.tenantId}`
                      : `${Number(item.price || item.room?.price || 0).toLocaleString('vi-VN')} đ/tháng`}
                  </td>
                  <td>{new Date(item.startDate).toLocaleDateString('vi-VN')}</td>
                  <td>{new Date(item.endDate).toLocaleDateString('vi-VN')}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  {userMode === 'Landlord' && (
                    <td>
                      {item.status === 'Pending' ? (
                        <>
                          <Button variant="success" size="sm" className="me-2" onClick={() => handleApprove(item.id)}>
                            Duyệt
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleReject(item.id)}>
                            Từ chối
                          </Button>
                        </>
                      ) : (
                        <small className="text-muted">Hoàn tất</small>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default Contracts;