-- Smart Employee & Project Management System Database Schema
CREATE DATABASE IF NOT EXISTS ems_db;
USE ems_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    department VARCHAR(50) NOT NULL,
    designation VARCHAR(50),
    salary DOUBLE,
    date_of_joining DATE,
    profile_image VARCHAR(255),
    user_id BIGINT UNIQUE,
    CONSTRAINT fk_employee_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE,
    deadline DATE,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED'
);

-- 4. Project Employees (Many-to-Many Join Table)
CREATE TABLE IF NOT EXISTS project_employees (
    project_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    PRIMARY KEY (project_id, employee_id),
    CONSTRAINT fk_pe_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_pe_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- 5. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    due_date DATE,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    remarks TEXT,
    project_id BIGINT NOT NULL,
    employee_id BIGINT,
    CONSTRAINT fk_task_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- 6. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    performed_by VARCHAR(50) NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    details TEXT
);
