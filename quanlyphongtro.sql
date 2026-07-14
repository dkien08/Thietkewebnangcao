-- =========================================================================
-- FILE: Quan_Ly_Phong_Tro.sql (CẬP NHẬT CHUẨN ĐẶC TẢ)
-- ĐỀ TÀI: HỆ THỐNG TÌM KIẾM VÀ ĐẶT PHÒNG TRỌ (BACKEND NESTJS)
-- BÀI KIỂM TRA GIỮA KỲ MÔN: THIẾT KẾ WEB NÂNG CAO
-- =========================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `favorites`;
DROP TABLE IF EXISTS `rental_contracts`;
DROP TABLE IF EXISTS `rooms`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------------------------
-- 1. ĐỐI TƯỢNG: USERS (QUẢN LÝ NGƯỜI DÙNG / TÀI KHOẢN)
-- -------------------------------------------------------------------------
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(15) NOT NULL,
    `role` ENUM('Tenant', 'Landlord') NOT NULL DEFAULT 'Tenant',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 2. ĐỐI TƯỢNG: ROOMS (QUẢN LÝ PHÒNG TRỌ / TIN ĐĂNG)
-- -------------------------------------------------------------------------
CREATE TABLE `rooms` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `landlord_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `area` DECIMAL(5, 2) NOT NULL,
    `district` VARCHAR(100) NOT NULL,
    `address_detail` TEXT NOT NULL,
    `has_ac` BOOLEAN DEFAULT 0,
    `has_wm` BOOLEAN DEFAULT 0,
    `status` ENUM('Available', 'Rented', 'Maintenance') NOT NULL DEFAULT 'Available',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`landlord_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 3. ĐỐI TƯỢNG: RENTAL_CONTRACTS (HỢP ĐỒNG / ĐẶT THUÊ PHÒNG)
-- -------------------------------------------------------------------------
CREATE TABLE `rental_contracts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` INT NOT NULL,
    `room_id` INT NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `contract_status` ENUM('Pending', 'Active', 'Expired', 'Rejected') NOT NULL DEFAULT 'Pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`tenant_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 4. ĐỐI TƯỢNG: FAVORITES (DANH SÁCH PHÒNG YÊU THÍCH)
-- -------------------------------------------------------------------------
CREATE TABLE `favorites` (
    `user_id` INT NOT NULL,
    `room_id` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`, `room_id`), -- Khóa chính phức hợp (Composite Primary Key)
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;