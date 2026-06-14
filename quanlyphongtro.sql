-- FILE: Quan_Ly_Phong_Tro.sql
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(15) NOT NULL,
    `role` ENUM('Tenant', 'Landlord') NOT NULL DEFAULT 'Tenant'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `rooms` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `landlord_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `area` DECIMAL(5, 2) NOT NULL,
    `district` VARCHAR(100) NOT NULL,
    `status` ENUM('Available', 'Rented', 'Maintenance') NOT NULL DEFAULT 'Available',
    FOREIGN KEY (`landlord_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;