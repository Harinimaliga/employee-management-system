# ⚡ Smart Employee & Project Management System (EMS & PMS)

[![Java](https://img.shields.io/badge/Java-17%2B-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.7-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Material UI](https://img.shields.io/badge/Material%20UI-5.15-007FFF.svg)](https://mui.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-red.svg)](https://jwt.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

> A production-ready Full Stack Enterprise Application for managing employees, projects, tasks, attendance, shifts, audit logs, and automated reporting with Role-Based Security (`ROLE_ADMIN` & `ROLE_EMPLOYEE`) and dual Light/Dark mode themes.

---

## 📌 Table of Contents
- [📌 Project Overview](#-project-overview)
- [🔄 System Architecture & Flowchart](#-system-architecture--flowchart)
- [✨ Features](#-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [🗄️ Database Setup](#️-database-setup)
- [▶️ How to Run the Project](#-how-to-run-the-project)
- [🐳 Docker Instructions](#-docker-instructions)
- [📷 Screenshots](#-screenshots)
- [🔗 API Documentation](#-api-documentation)
- [🚀 Future Enhancements](#-future-enhancements)
- [👩‍💻 Author Information](#-author-information)

---

## 📌 Project Overview

The **Smart Employee & Project Management System** is an enterprise-grade full-stack web application designed to streamline corporate workforce management, project team allocations, attendance tracking, shift scheduling, system audit trails, and executive report generation.

> [!IMPORTANT]
> **Status**: 100% Completed, Verified & Live on `http://localhost:3000` (React Frontend) and `http://localhost:8080` (Spring Boot REST API).

---

## 🔄 System Architecture & Flowchart

```mermaid
flowchart TD
    classDef userLayer fill:#0284c7,stroke:#38bdf8,stroke-width:2px,color:#fff
    classDef reactLayer fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#fff
    classDef axiosLayer fill:#1e293b,stroke:#818cf8,stroke-width:2px,color:#fff
    classDef jwtLayer fill:#4338ca,stroke:#a855f7,stroke-width:2px,color:#fff
    classDef springLayer fill:#064e3b,stroke:#22c55e,stroke-width:2px,color:#fff
    classDef dbLayer fill:#450a0a,stroke:#ef4444,stroke-width:2px,color:#fff

    User["👤 User / Admin Browser"]:::userLayer
    User -->|1. Interacts with UI| ReactUI["💻 React 18 SPA Frontend - Port 3000"]:::reactLayer

    subgraph Client_Side ["Client Execution Space"]
        ReactUI -->|2. Form Actions & Navigation| AxiosClient["⚡ Axios API Calls"]:::axiosLayer
        AxiosClient -->|3. Attach Header Authorization Bearer JWT| AxiosClient
    end

    AxiosClient -->|4. HTTP REST Request| JwtFilter["🔐 Spring Security JWT Validation Filter"]:::jwtLayer

    subgraph Backend_Security ["Spring Boot Security & Controllers - Port 8080"]
        JwtFilter -->|5a. Valid JWT| SecurityContext["Set SecurityContextHolder Authentication"]:::jwtLayer
        JwtFilter -->|5b. Invalid / Missing JWT| AuthEntryPoint["Return HTTP 401 / 403 Error"]:::jwtLayer
        SecurityContext --> Controllers["🎮 Spring Boot REST Controllers"]:::springLayer
        Controllers -->|AuthController| AuthEndpoints["/api/auth/login, /api/auth/register"]:::springLayer
        Controllers -->|EmployeeController| EmpEndpoints["/api/employees/*"]:::springLayer
        Controllers -->|ProjectController| ProjEndpoints["/api/projects/*"]:::springLayer
        Controllers -->|TaskController| TaskEndpoints["/api/tasks/*"]:::springLayer
        Controllers -->|AttendanceController| AttEndpoints["/api/attendance/*"]:::springLayer
        Controllers -->|ShiftController| ShiftEndpoints["/api/shifts/*"]:::springLayer
        Controllers -->|AuditLogController| AuditEndpoints["/api/audit-logs/*"]:::springLayer
        Controllers -->|ReportController| ReportEndpoints["/api/reports/*"]:::springLayer
    end

    subgraph Business_Logic_Layer ["Service & Repository Layer"]
        Controllers --> Services["⚙️ Service Layer - Business Logic & DTO Mapping"]:::springLayer
        Services --> Repositories["🗄️ Repository Layer - Spring Data JPA"]:::springLayer
    end

    subgraph Database_Layer ["MySQL Persistence Layer"]
        Repositories -->|SQL Queries via HikariCP| MySQL[("📊 MySQL Database - ems_db")]:::dbLayer
        MySQL -->|Tables: users, employees, projects, tasks, attendance, shifts, audit_logs| Repositories
    end

    Repositories --> Services
    Services --> Controllers
    Controllers -->|JSON / File Stream Response| User
```

---

## ✨ Features

### 🔐 Security & Role-Based Access Control (RBAC)
* **JWT Token Security**: Stateless session management signed with HMAC-SHA256.
* **BCrypt Hashing**: Password encryption for stored credentials.
* **Role Privileges**:
  * **ADMIN**: Full CRUD permissions on Employees, Projects, Tasks, Shifts, Attendance, Audit Logs, and PDF/Excel Exports.
  * **EMPLOYEE**: Access to personal dashboard, 1-Click Check In/Out, assigned tasks, and status/remarks updates.

### 🎨 Dual Theme System (Light ☀️ & Dark 🌙)
* 1-Click theme toggle in top navbar & login screens.
* **Light Mode**: Crisp `#ffffff` cards and tables, `#f1f5f9` light slate backgrounds, `#0f172a` text, `#cbd5e1` borders.
* **Dark Mode**: Deep `#090d16` background, `#0f172a` cards, `#1e293b` borders, and rich gradient banner cards.

### 👥 Employee Management & Profile Upload
* **Directory Grid**: Sortable headers, search, department filtering, and pagination.
* **Profile Image Upload**: Multipart upload controller storing images in `uploads/` with live avatar preview.

### 📁 Project & Task Management
* **Project Portfolio**: Multi-select employee allocation, priority badges (`LOW`, `MEDIUM`, `HIGH`), and status tracking.
* **Task Tracker**: Progress percentage bars (0-100%), due dates, and status updates (`TODO`, `IN_PROGRESS`, `COMPLETED`).

### ⏱️ Attendance & Shift Management
* **1-Click Check In / Check Out**: Real-time working hours calculation (supports overnight shifts across midnight).
* **Shift Scheduling**: Default seeded shifts (Morning, Afternoon, Night, General) with grace periods and status badges.

### 📊 Reports & Audit Logging
* **System Audit Trail**: Real-time security and data operation logs (`SYSTEM_INIT`, `USER_REGISTER`, `USER_LOGIN`, `CREATE_PROJECT`, `ASSIGN_TASK`, `CHECK_IN`).
* **1-Click Exports**: Download OpenPDF summaries or Apache POI `.xlsx` datasets for tasks, projects, and attendance.

---

## 🛠️ Technology Stack

| Layer | Technology / Library | Description |
|---|---|---|
| **Frontend** | React 18, React Router v6 | Single Page Application architecture |
| **Styling & UI** | Material UI (MUI v5), Bootstrap Icons | Responsive glassmorphic UI |
| **HTTP Client** | Axios | Configured with Bearer Token interceptors |
| **Backend** | Java 17+, Spring Boot 4.0.7 | RESTful microservice architecture |
| **Security** | Spring Security 7, JJWT 0.12.6 | Stateless JWT Authentication & RBAC |
| **Database** | MySQL 8.0, Spring Data JPA | Relational ORM with HikariCP Pooling |
| **Exports** | OpenPDF 2.0, Apache POI 5.3 | Automated PDF & Excel document generation |
| **API Docs** | Springdoc OpenAPI 2.8, Swagger UI | Interactive API documentation |
| **Containers** | Docker, Docker Compose | Multi-container environment isolation |

---

## 🗄️ Database Setup

1. Open MySQL Command Line or Workbench:
```sql
CREATE DATABASE IF NOT EXISTS ems_db;
```
2. Import the database schema from `schema.sql`:
```powershell
mysql -u root -p ems_db < schema.sql
```

---

## ▶️ How to Run the Project

### 1. Backend Setup (Spring Boot)

Config Credentials (`src/main/resources/application.properties`):
* **Database URL**: `jdbc:mysql://localhost:3306/ems_db`
* **Username**: `root` | **Password**: `Harini@123`

Run Backend Server:
```powershell
.\mvnw.cmd spring-boot:run
```
* **Backend API Base**: `http://localhost:8080`
* **Swagger UI API Docs**: `http://localhost:8080/swagger-ui.html`

### 2. Frontend Setup (ReactJS)

```powershell
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start React Dev Server
npm start
```
* **React Web App URL**: `http://localhost:3000`

---

## 🐳 Docker Instructions

Run the complete application stack (MySQL + Backend + Frontend) using Docker Compose:

```powershell
# Build and run containers in detached mode
docker-compose up --build -d
```

### Access Services:
* **Frontend Web App**: `http://localhost:3000`
* **Backend REST API**: `http://localhost:8080/api`
* **Swagger Documentation**: `http://localhost:8080/swagger-ui.html`

### Stop Containers:
```powershell
docker-compose down
```

---

## 📷 Screenshots

* **Dashboard & Telemetry**: Full workforce overview, task milestone progress, and interactive telemetry charts.
* **Employee Directory**: Paginated employee table with search, profile picture upload, and department filters.
* **Attendance & Shifts**: 1-Click Check In/Out, working hours, overtime badges, and shift schedule cards.
* **System Audit Logs**: Real-time event auditing and user activity tracking.

---

## 🔗 API Documentation

Available live at **[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)**.

| Endpoint | Method | Description | Role Required |
|---|---|---|---|
| `/api/auth/register` | `POST` | Register a new user | Public |
| `/api/auth/login` | `POST` | Authenticate & acquire JWT Token | Public |
| `/api/auth/me` | `GET` | Get currently logged-in user profile | Authenticated |
| `/api/employees` | `GET` | Get all employees | Authenticated |
| `/api/employees` | `POST` | Create employee | `ROLE_ADMIN` |
| `/api/employees/{id}` | `PUT` | Update employee details | `ROLE_ADMIN` / `ROLE_EMPLOYEE` |
| `/api/upload/profile-image` | `POST` | Upload employee profile picture | Authenticated |
| `/api/projects` | `GET` | Get all projects | Authenticated |
| `/api/projects` | `POST` | Create project | `ROLE_ADMIN` |
| `/api/projects/{id}/assign` | `POST` | Assign employees (Many-to-Many) | `ROLE_ADMIN` |
| `/api/tasks` | `GET` | Get all tasks | Authenticated |
| `/api/tasks` | `POST` | Create & assign task | `ROLE_ADMIN` |
| `/api/tasks/{id}/status` | `PATCH` | Update task status & remarks | Authenticated |
| `/api/attendance/check-in` | `POST` | 1-Click employee check-in | Authenticated |
| `/api/attendance/check-out/{id}` | `POST` | Employee check-out | Authenticated |
| `/api/shifts` | `GET` | Get all work shifts | Authenticated |
| `/api/audit-logs` | `GET` | Get system audit trail logs | Authenticated |
| `/api/reports/tasks/pdf` | `GET` | Download PDF Task Summary | Authenticated |
| `/api/reports/tasks/excel` | `GET` | Download Excel `.xlsx` Dataset | Authenticated |

---

## 🚀 Future Enhancements

- [ ] WebSockets integration for real-time live notification alerts.
- [ ] Redis Caching for employee search query optimization.
- [ ] Biometric Integration support for automated attendance clock-in.

---

## 👩‍💻 Author Information

* **Developer**: **Harini Maliga**
* **Role**: Java Full Stack Developer
* **Project**: Smart Employee & Project Management System
* **Repository**: [employee-management-system](https://github.com/Harinimaliga/employee-management-system)
* **Date**: July 2026
