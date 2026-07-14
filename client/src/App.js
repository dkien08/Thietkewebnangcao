import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import AnhManCity1 from './assets/anh_man_city_6_bd4de7ace8.jpg';
import AnhManCity2 from './assets/anh-man-city-1.webp';
import AnhManCity3 from './assets/hinh-nen-manchester-city-1.jpg';

const API_URL = "https://probable-space-meme-69p55wpjxpxwhr7rq-3000.app.github.dev/api/rooms"; 
function App() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    axios.get(API_URL)
      .then(response => {
        setRooms(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi khi kết nối đến backend NestJS:", err);
        setError("Không thể đồng bộ dữ liệu phòng trọ từ hệ thống.");
        setLoading(false);
      });
  }, []);

  return (
    <BrowserRouter>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold" to="/api/">MY APP</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavDropdown">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link active" to="/api/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/api/login">Đăng nhập</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/api/register">Đăng ký</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* 2. BANNER (Slide ảnh chạy) */}
      <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1" aria-label="Slide 2"></button>
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2" aria-label="Slide 3"></button>
        </div>
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src={AnhManCity1} className="d-block w-100" style={{ height: '400px', objectFit: 'cover' }} alt="Banner 1"/>
          </div>
          <div className="carousel-item">
            <img src={AnhManCity2} className="d-block w-100" style={{ height: '400px', objectFit: 'cover' }} alt="Banner 2"/>
          </div>
          <div className="carousel-item">
            <img src={AnhManCity3} className="d-block w-100" style={{ height: '400px', objectFit: 'cover' }} alt="Banner 3"/>
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      <div className="container mt-5">
        <h3 className="fw-bold mb-4">Danh sách phòng trọ đang trống</h3>

        {loading && (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang kết nối database...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger text-center shadow-sm" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && (
          rooms.length === 0 ? (
            <p className="text-center text-muted">Hiện tại chưa có phòng trọ nào được đăng trên hệ thống.</p>
          ) : (
            <div className="row row-cols-1 row-cols-md-3 g-4">
              {rooms.map((room) => (
                <div className="col" key={room.id}>
                  <div className="card h-100 shadow-sm border-0 position-relative">
                    
                    {/* Badge trạng thái dựa theo enum: Available, Rented, Maintenance */}
                    <span className={`position-absolute top-0 end-0 m-2 badge ${
                      room.status === 'Available' ? 'bg-success' : room.status === 'Rented' ? 'bg-secondary' : 'bg-warning'
                    }`}>
                      {room.status === 'Available' ? 'Còn trống' : room.status === 'Rented' ? 'Đã thuê' : 'Bảo trì'}
                    </span>

                    <img src={AnhManCity3} className="card-img-top" style={{ height: '200px', objectFit: 'cover' }} alt={room.title}/>
                    
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title text-danger fw-bold fs-4">
                        {Number(room.price).toLocaleString('vi-VN')} đ/tháng
                      </h5>
                      
                      <h6 className="card-text fw-bold text-dark text-truncate" title={room.title}>
                        {room.title}
                      </h6>
                      
                      <p className="text-muted small mb-2 text-truncate">
                        <i className="bi bi-geo-alt-fill text-danger"></i> Khu vực: {room.district} - {room.addressDetail}
                      </p>

                      <div className="mb-3 mt-auto">
                        {room.hasAc && <span className="badge bg-info text-dark me-1">Điều hòa</span>}
                        {room.hasWm && <span className="badge bg-secondary me-1">Máy giặt</span>}
                      </div>

                      <div className="d-flex justify-content-between text-secondary small border-top pt-2">
                        <span><i className="bi bi-arrows-fullscreen"></i> Diện tích: <strong>{room.area} m²</strong></span>
                      </div>
                    </div>
                    
                    <div className="card-footer bg-white border-top-0 pb-3">
                      <button className="btn btn-outline-primary w-100 fw-semibold">Xem chi tiết</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* 4. FOOTER (Chân trang) */}
        <footer className="bg-dark text-white text-center py-4 mt-5 rounded-top">
          <div className="container">
            <p className="mb-0">© 2026. All rights reserved.</p>
            <small className="text-muted">Thiết kế với Bootstrap 5 & React</small>
          </div>
        </footer>
      </div>

      {/* Cấu hình đường dẫn hệ thống */}
      <Routes>
        <Route path="/api/" element={<Home />} />
        <Route path="/api/login" element={<Login />} />
        <Route path="/api/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;