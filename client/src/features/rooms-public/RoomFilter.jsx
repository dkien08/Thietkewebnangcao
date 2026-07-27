import React, { useState } from 'react';
import { Card, Form, Row, Col, Button } from 'react-bootstrap';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const RoomFilter = ({ onSearch, onReset }) => {
  const [filters, setFilters] = useState({
    district: '',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    hasAc: false,
    hasWm: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Loại bỏ các trường rỗng/false trước khi gửi
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '' && v !== false)
    );
    onSearch(cleanedFilters);
  };

  const handleReset = () => {
    const resetState = {
      district: '',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      hasAc: false,
      hasWm: false,
    };
    setFilters(resetState);
    onReset();
  };

  return (
    <Card className="shadow-sm mb-4 border-0">
      <Card.Body>
        <h5 className="mb-3 text-primaryfw-bold">
          <SearchOutlined className="me-2" />
          Bộ lọc tìm kiếm nâng cao
        </h5>
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            {/* Quận / Huyện */}
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Quận / Huyện</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ví dụ: Cầu Giấy, Đống Đa..."
                  name="district"
                  value={filters.district}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            {/* Khoảng giá */}
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Khoảng giá (VNĐ)</Form.Label>
                <div className="d-flex align-items-center gap-1">
                  <Form.Control
                    type="number"
                    placeholder="Tối thiểu"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleChange}
                  />
                  <span>-</span>
                  <Form.Control
                    type="number"
                    placeholder="Tối đa"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleChange}
                  />
                </div>
              </Form.Group>
            </Col>

            {/* Diện tích */}
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Diện tích (m²)</Form.Label>
                <div className="d-flex align-items-center gap-1">
                  <Form.Control
                    type="number"
                    placeholder="Min"
                    name="minArea"
                    value={filters.minArea}
                    onChange={handleChange}
                  />
                  <span>-</span>
                  <Form.Control
                    type="number"
                    placeholder="Max"
                    name="maxArea"
                    value={filters.maxArea}
                    onChange={handleChange}
                  />
                </div>
              </Form.Group>
            </Col>

            {/* Tiện ích */}
            <Col md={3} className="d-flex align-items-end">
              <div className="d-flex gap-3 mb-2">
                <Form.Check
                  type="checkbox"
                  id="hasAc"
                  label="Điều hòa"
                  name="hasAc"
                  checked={filters.hasAc}
                  onChange={handleChange}
                />
                <Form.Check
                  type="checkbox"
                  id="hasWm"
                  label="Máy giặt"
                  name="hasWm"
                  checked={filters.hasWm}
                  onChange={handleChange}
                />
              </div>
            </Col>

            {/* Nút tìm kiếm */}
            <Col md={12} className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="outline-secondary" onClick={handleReset}>
                <ReloadOutlined className="me-1" /> Đặt lại
              </Button>
              <Button variant="primary" type="submit">
                <SearchOutlined className="me-1" /> Tìm kiếm phòng
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default RoomFilter;