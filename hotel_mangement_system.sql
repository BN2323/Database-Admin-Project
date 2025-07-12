create database hotel_management_system;

use hotel_management_system;
-- ================================
-- Roles and Permissions
-- ================================
CREATE TABLE roles (
  role_id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE permissions (
  permission_id INT AUTO_INCREMENT PRIMARY KEY,
  permission_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE rolepermissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT,
  permission_id INT,
  FOREIGN KEY (role_id) REFERENCES roles(role_id),
  FOREIGN KEY (permission_id) REFERENCES permissions(permission_id)
);

-- Sample roles
INSERT INTO roles (role_name) VALUES ('guest'), ('staff'), ('admin');

-- ================================
-- Unified Users table
-- ================================
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE,
  password_hash VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  role_id INT,
  is_deleted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- Guest-specific details
CREATE TABLE guest_details (
  user_id INT PRIMARY KEY,
  address TEXT,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ================================
-- Rooms
-- ================================
CREATE TABLE rooms (
  room_id INT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(20) UNIQUE NOT NULL,
  type VARCHAR(50),
  status VARCHAR(20),
  price DECIMAL(10,2),
  description TEXT
);

-- ================================
-- Bookings (linked to users)
-- ================================
CREATE TABLE bookings (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  room_id INT,
  checkin_date DATE,
  checkout_date DATE,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (room_id) REFERENCES rooms(room_id)
);

-- ================================
-- Payments (linked to bookings)
-- ================================
CREATE TABLE payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT,
  amount DECIMAL(10,2),
  method VARCHAR(50),
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

-- ================================
-- Reviews (linked to users and rooms)
-- ================================
CREATE TABLE reviews (
  review_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  room_id INT,
  rating INT,
  comment TEXT,
  review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (room_id) REFERENCES rooms(room_id)
);

-- ================================
-- Services and Booked Services
-- ================================
CREATE TABLE services (
  service_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  price DECIMAL(10,2),
  description TEXT
);

CREATE TABLE booked_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT,
  service_id INT,
  quantity INT,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
  FOREIGN KEY (service_id) REFERENCES services(service_id)
);

-- ================================
-- Room Maintenance (linked to users)
-- ================================
CREATE TABLE roommaintenance (
  maintenance_id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT,
  user_id INT,
  description TEXT,
  maintenance_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(room_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);


select * from users;