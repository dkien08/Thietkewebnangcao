import React, { useState } from 'react';
import { Form, Table, Button, Dropdown } from 'react-bootstrap';
import { 
  HomeOutlined, BarChartOutlined, EyeOutlined, CheckSquareOutlined,
  FileTextOutlined, CalendarOutlined, SearchOutlined, BellOutlined, 
  UserOutlined, EditOutlined, UnorderedListOutlined
} from '@ant-design/icons';
import './PhenikaaLayout.css';

const PhenikaaLayout = () => {
  const [dataList] = useState([
    {
      id: 1,
      code: 'CSE702051-2-3-25(N01.LT1)',
      name: 'Thiết kế web nâng cao-2-3-25(N01.LT1)',
      startDate: '18/05/2026',
      endDate: '26/07/2026',
      count: 40,
      status: 'Điểm danh'
    },
    {
      id: 2,
      code: 'CSE702051-2-3-25(N01.LT2)',
      name: 'Thiết kế web nâng cao-2-3-25(N01.LT2)',
      startDate: '11/05/2026',
      endDate: '26/07/2026',
      count: 40,
      status: 'Điểm danh'
    }
  ]);

  return (
    <div className="phenikaa-dashboard d-flex">
      <div className="phenikaa-sidebar">
        <div className="sidebar-brand">
          <div className="brand-title">PHENIKAA</div>
          <div className="brand-sub">UNIVERSITY</div>
        </div>

        <div className="sidebar-nav">
          <div className="nav-link"><HomeOutlined /> Trang chủ</div>
          <div className="nav-link"><BarChartOutlined /> Thống kê</div>
          <div className="nav-link"><EyeOutlined /> Giám sát thi</div>
          <div className="nav-link"><CheckSquareOutlined /> Duyệt điểm thi trắc nghiệm</div>
          <div className="nav-link"><FileTextOutlined /> Tin tức</div>
          <div className="nav-link"><BarChartOutlined /> Quản lý điểm</div>

          <div className="sidebar-menu-group mt-2">
            <div className="sidebar-menu-header">
              <CalendarOutlined /> Lịch giảng
            </div>
            <ul className="sidebar-submenu">
              <li>• Thời khóa biểu</li>
              <li className="active">• Danh sách người học theo lớp</li>
              <li>• Thời khóa biểu - Sinh Viên</li>
              <li>• Thời khóa biểu - Phòng học</li>
              <li>• Khối lượng cá nhân</li>
            </ul>
          </div>

          <div className="nav-link mt-2"><FileTextOutlined /> Văn bản</div>
        </div>
      </div>

      <div className="flex-grow-1 d-flex flex-column">
        <div className="phenikaa-header">
          <div className="header-search">
            <Form.Control type="text" placeholder="Tìm kiếm chức năng..." />
            <SearchOutlined className="search-icon" />
          </div>

          <div className="d-flex align-items-center gap-3">
            <BellOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
            <div className="d-flex align-items-center gap-2 border-start ps-3 border-secondary">
              <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style={{ width: 30, height: 30 }}>
                <UserOutlined />
              </div>
              <span style={{ fontSize: '0.85rem' }}>Nguyễn Lệ Thu</span>
            </div>
          </div>
        </div>

        <div className="breadcrumb-bar">
          Lịch giảng &gt; <span className="fw-bold text-dark">Danh sách người học theo lớp</span>
        </div>

        <div className="p-4 flex-grow-1">
          <div className="content-card">
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
              <div className="d-flex align-items-center gap-4">
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted fs-7">Thời gian</span>
                  <Form.Select size="sm" defaultValue="2025_2026_3,2" style={{ width: 160 }}>
                    <option value="2025_2026_3,2">2025_2026_3,2</option>
                  </Form.Select>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted fs-7">Học phần</span>
                  <Form.Select size="sm" defaultValue="" style={{ width: 180 }}>
                    <option value="">Chọn học phần</option>
                  </Form.Select>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <Button className="btn-phenikaa-primary">
                  <UnorderedListOutlined className="me-1" /> Danh sách
                </Button>
                <Button className="btn-phenikaa-primary">
                  <CheckSquareOutlined className="me-1" /> Xác nhận hoàn thành điểm danh tất cả các buổi học
                </Button>
                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" size="sm" style={{ fontSize: '0.85rem' }}>
                    <FileTextOutlined className="me-1" /> Báo cáo
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item>Xuất báo cáo Excel</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>

            <Table responsive hover className="phenikaa-table text-center align-middle border">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>STT</th>
                  <th>Mã lớp</th>
                  <th className="text-start">Tên lớp</th>
                  <th>Ngày bắt đầu</th>
                  <th>Ngày kết thúc</th>
                  <th>Số lượng</th>
                  <th>Điểm danh</th>
                  <th>Chi tiết</th>
                  <th style={{ width: '40px' }}><Form.Check type="checkbox" /></th>
                </tr>
              </thead>
              <tbody>
                {dataList.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td className="text-secondary">{item.code}</td>
                    <td className="text-start fw-semibold text-dark">{item.name}</td>
                    <td>{item.startDate}</td>
                    <td>{item.endDate}</td>
                    <td>{item.count}</td>
                    <td>
                      <Button variant="light" size="sm" className="border text-dark bg-light px-3 py-1 fs-7">
                        {item.status}
                      </Button>
                    </td>
                    <td>
                      <Button variant="link" size="sm" className="p-0 text-primary">
                        <EditOutlined />
                      </Button>
                    </td>
                    <td>
                      <Form.Check type="checkbox" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhenikaaLayout;