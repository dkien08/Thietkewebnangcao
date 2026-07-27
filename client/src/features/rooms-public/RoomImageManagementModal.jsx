import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Row, Col, Card } from 'react-bootstrap';
import { DeleteOutlined, PlusOutlined, PictureOutlined } from '@ant-design/icons';
import { roomApi } from '../../api/roomApi';
import toast from 'react-hot-toast';

const RoomImageManagementModal = ({ show, onHide, room, onUpdateSuccess }) => {
  // 🟢 Đảm bảo state images luôn là một mảng an toàn tuyệt đối
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Load danh sách ảnh hiện có của phòng khi mở Modal
  useEffect(() => {
    if (room && Array.isArray(room.images)) {
      setImages(room.images);
    } else {
      setImages([]);
    }
    setSelectedFiles([]);
    setPreviews([]);
  }, [room, show]);

  // Xử lý chọn ảnh từ máy tính
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setSelectedFiles(files);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  // Upload ảnh mới lên Server
  const handleUploadImages = async () => {
    if (!selectedFiles.length) {
      toast.error('Vui lòng chọn ít nhất 1 hình ảnh!');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      
      // 🟢 Nếu Backend dùng FilesInterceptor (nhiều file), đổi key thành 'images' hoặc lặp đúng chuẩn. 
      // Ở đây dùng chung key 'image' hoặc 'files' tùy theo backend của bạn hỗ trợ.
      selectedFiles.forEach((file) => {
        formData.append('image', file); // Hoặc 'files' nếu backend bắt nhiều file
      });

      // Gọi API thêm ảnh vào phòng
      const response = await roomApi.addRoomImages(room.id, formData);
      toast.success('Thêm hình ảnh thành công!');
      
      // Reset ô chọn file và preview
      setSelectedFiles([]);
      setPreviews([]);
      
      // Bóc tách dữ liệu trả về an toàn
      const resData = response.data?.data || response.data || response;
      const updatedImages = resData.images || (Array.isArray(resData) ? resData : []);
      
      setImages(Array.isArray(updatedImages) ? updatedImages : []);
      
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Tải ảnh lên thất bại. Vui lòng thử lại!');
    } finally {
      setUploading(false);
    }
  };

  // Hàm chuẩn hóa đường dẫn ảnh từ DB thành URL hoàn chỉnh
const getImageUrl = (url) => {
  if (!url) return '';
  
  // Nếu đã là link tuyệt đối (http://, https://, hoặc blob:) thì giữ nguyên
  if (url.startsWith('http') || url.startsWith('blob:')) {
    return url;
  }

  // Tự động nhận diện domain Backend (cổng 3000) dựa vào môi trường hiện tại
  const backendHost = window.location.hostname.includes('app.github.dev')
    ? window.location.hostname.replace('-3001', '-3000') // Đổi port 3001 thành 3000
    : 'localhost:3000';

  const protocol = window.location.protocol;
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  
  // Đảm bảo đường dẫn có tiền tố /uploads/
  const finalUri = cleanPath.includes('/uploads/') ? cleanPath : `/uploads${cleanPath}`;

  return `${protocol}//${backendHost}${finalUri}`;
};

  // Xóa 1 ảnh đã có của phòng
  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh này?')) return;

    setDeletingId(imageId);
    try {
      await roomApi.deleteRoomImage(room.id, imageId);
      toast.success('Đã xóa hình ảnh!');

      // Cập nhật lại UI sau khi xóa an toàn
      setImages((prev) => (Array.isArray(prev) ? prev.filter((img) => img.id !== imageId) : []));
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Xóa hình ảnh thất bại!');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="fs-5 fw-bold">
          <PictureOutlined className="me-2 text-primary" />
          Quản lý ảnh - {room?.title || `Phòng ${room?.id}`}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* KHUNG 1: TẢI ẢNH MỚI LÊN */}
        <div className="p-3 bg-light rounded border mb-4">
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Thêm ảnh mới cho phòng</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={uploading}
            />
          </Form.Group>

          {/* Xem trước ảnh vừa chọn */}
          {previews.length > 0 && (
            <div className="d-flex flex-wrap gap-2 mb-3">
              {previews.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt="preview"
                  style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px' }}
                />
              ))}
            </div>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={handleUploadImages}
            disabled={uploading || !selectedFiles.length}
          >
            {uploading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang tải lên...
              </>
            ) : (
              <>
                <PlusOutlined className="me-1" /> Đăng ảnh
              </>
            )}
          </Button>
        </div>

        {/* KHUNG 2: DANH SÁCH ẢNH ĐÃ CÓ */}
        <h6 className="fw-bold mb-3">Ảnh hiện tại ({Array.isArray(images) ? images.length : 0})</h6>
        
        {!Array.isArray(images) || images.length === 0 ? (
          <div className="text-center py-4 text-muted border rounded">
            Phòng này chưa có hình ảnh nào.
          </div>
        ) : (
          <Row xs={2} md={3} lg={4} className="g-3">
            {images.map((img) => {
              const imgId = img?.id || img;
              const imgSrc = img?.imageUrl || img;
              return (
                <Col key={imgId}>
                  <Card className="h-100 shadow-sm border-0 position-relative">
                    <Card.Img
                      variant="top"
                      src={imgSrc}
                      style={{ height: '120px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 m-1 rounded-circle p-1 d-flex align-items-center justify-content-center"
                      style={{ width: '28px', height: '28px' }}
                      onClick={() => handleDeleteImage(img?.id)}
                      disabled={deletingId === img?.id}
                      title="Xóa ảnh này"
                    >
                      {deletingId === img?.id ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <DeleteOutlined />
                      )}
                    </Button>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RoomImageManagementModal;