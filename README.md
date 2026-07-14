Thietkewebnangcao-main/               # Thư mục gốc của dự án
├── .devcontainer/                    # Cấu hình môi trường Docker cho dự án
│   ├── devcontainer.json
│   └── docker-compose.yml
├── node_modules/                     # Thư mục chứa các thư viện đã cài đặt (Tự động sinh)
├── src/                              # Thư mục chứa toàn bộ mã nguồn ứng dụng
│   ├── config/                       # Cấu hình hệ thống (Database, JWT, Mail...)
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
│   ├── favorite/                     # MODULE PHÒNG TRỌ YÊU THÍCH (MỚI BỔ SUNG)
│   │   ├── dto/
│   │   │   └── toggle-favorite.dto.ts # DTO chứa roomId khi bấm thích/bỏ thích
│   │   ├── entities/
│   │   │   └── favorite.entity.ts     # Entity tương ứng bảng favorites trong DB
│   │   ├── favorite.controller.ts    # Nhận Request (F07 - Lưu, F18 - Xem danh sách yêu thích)
│   │   ├── favorite.service.ts       # Logic thêm/xóa khỏi danh sách, truy vấn phòng yêu thích
│   │   └── favorite.module.ts
│   │
│   ├── app.module.ts                 # Module gốc của hệ thống (Liên kết User, Rooms, Contract, Favorite)
│   └── main.ts                       # Điểm khởi chạy của ứng dụng (Khởi tạo NestFactory, lắng nghe Port)
│
├── .env                              # Lưu trữ biến môi trường bảo mật (Không push lên Github)
├── .gitignore                        # Khai báo các file/thư mục Git cần bỏ qua (nhu node_modules, .env)
├── package.json                      # Quản lý thông tin dự án, scripts chạy và danh sách thư viện
├── tsconfig.json                     # Cấu hình trình biên dịch TypeScript
└── quanlyphongtro.sql                # File đặc tả cơ sở dữ liệu mẫu
