<<<<<<< HEAD
# Thietkewebnangcao
=======
## 📂 Cấu trúc thư mục dự án (Project Folder Structure)

```text
Thietkewebnangcao-main/               # Thư mục gốc của dự án
├── .devcontainer/                    # Cấu hình môi trường Docker cho dự án
│   ├── devcontainer.json
│   └── docker-compose.yml
├── node_modules/                     # Thư mục chứa các thư viện đã cài đặt (Tự động sinh)
├── src/                              # Thư mục chứa toàn bộ mã nguồn ứng dụng
│   ├── config/                       # Cấu hình hệ thống (Database, JWT...)
│   │   └── database.config.ts        
│   │
│   ├── user/                         # MODULE QUẢN LÝ NGƯỜI DÙNG
│   │   ├── dto/                      # Nơi định nghĩa các file validate dữ liệu đầu vào
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── entities/                 # Định nghĩa Model/Entity ánh xạ trực tiếp xuống DB
│   │   │   └── user.entity.ts
│   │   ├── user.controller.ts        # Tầng nhận Request HTTP từ Client (F01 - F03)
│   │   ├── user.service.ts           # Tầng xử lý Logic nghiệp vụ
│   │   └── user.module.ts            # File gom nhóm và cấu hình cho UserModule
│   │
│   ├── rooms/                        # MODULE QUẢN LÝ PHÒNG TRỌ
│   │   ├── dto/
│   │   │   ├── create-room.dto.ts
│   │   │   └── filter-room.dto.ts
│   │   ├── entities/
│   │   │   └── room.entity.ts
│   │   ├── rooms.controller.ts       # Tầng nhận Request HTTP (F04 - F06, F10 - F13)
│   │   ├── rooms.service.ts          # Tầng xử lý logic tìm kiếm, lọc, đăng phòng
│   │   └── rooms.module.ts
│   │
│   ├── contract/                     # MODULE QUẢN LÝ HỢP ĐỒNG & THUÊ PHÒNG
│   │   ├── dto/
│   │   │   └── create-contract.dto.ts
│   │   ├── entities/
│   │   │   └── contract.entity.ts
│   │   ├── contract.controller.ts    # Tầng nhận Request HTTP (F08, F09, F14, F15, F17)
│   │   ├── contract.service.ts       # Tầng xử lý logic duyệt và đồng bộ trạng thái phòng
│   │   └── contract.module.ts
│   │
│   ├── favorite/                     # MODULE PHÒNG TRỌ YÊU THÍCH
│   │   ├── dto/
│   │   │   └── toggle-favorite.dto.ts # DTO chứa dữ liệu yêu cầu khi lưu phòng thích
│   │   ├── entities/
│   │   │   └── favorite.entity.ts     # Entity tương ứng bảng favorites trong DB
│   │   ├── favorite.controller.ts    # Nhận Request (F07 - Lưu, F18 - Xem danh sách thích)
│   │   ├── favorite.service.ts       # Logic thêm/xóa, truy vấn danh sách yêu thích
│   │   └── favorite.module.ts
│   │
│   ├── app.module.ts                 # Module gốc liên kết toàn bộ hệ thống
│   └── main.ts                       # Điểm khởi chạy của ứng dụng (Khởi tạo NestFactory)
│
├── .env                              # Lưu trữ biến môi trường bảo mật (Không push lên GitHub)
├── .gitignore                        # Khai báo các file/thư mục Git cần bỏ qua
├── package.json                      # Quản lý thông tin dự án, scripts và thư viện cài đặt
├── tsconfig.json                     # Cấu hình trình biên dịch TypeScript
└── quanlyphongtro.sql                # File đặc tả cơ sở dữ liệu mẫu
\```
>>>>>>> ce030cb88547aacc76626a3663561c32aa2cdae7
