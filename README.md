# Smart Employee & Project Management System (EMS & PMS)

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Material UI](https://img.shields.io/badge/Material%20UI-5-007FFF.svg)](https://mui.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)

A full-stack web application built to handle employee directory management, project allocations, task progress tracking, attendance check-ins, work shift scheduling, and automated PDF/Excel reporting.

---

## 💻 System Architecture

```mermaid
flowchart LR
    User[Client Browser] -->|React 18 / Material UI| Frontend[React SPA - Port 3000]
    Frontend -->|Axios REST + JWT Header| Security[Spring Security / JWT Filter]
    Security -->|Controllers & Services| Backend[Spring Boot 3 - Port 8080]
    Backend -->|Spring Data JPA / HikariCP| Database[(MySQL 8.0 Database)]
```

---

## ⚡ Key Features

* **Authentication & Role Security**: Stateless JWT authentication with distinct `ADMIN` and `EMPLOYEE` role privileges.
* **User Profile & Avatar Upload**: Disk-backed profile photo uploads with live avatar preview.
* **Employee Management**: Filterable directory grid with search, department allocation, and CRUD actions.
* **Project & Team Allocation**: Multi-employee team assignments per project with priority badges (`HIGH`, `MEDIUM`, `LOW`) and deadline tracking.
* **Task Tracker**: Progress percentage sliders (0–100%), status updates (`TODO`, `IN_PROGRESS`, `COMPLETED`), and comments.
* **Attendance & Shifts**: 1-Click daily check-in/out, automatic working hours & overtime calculation, and default shift presets.
* **Audit Trail & Event Logs**: System activity auditing for user logins, task assignments, and record updates.
* **1-Click Export Reports**: Download PDF summaries (OpenPDF) or Excel `.xlsx` datasets (Apache POI).
* **Dual Light & Dark Themes**: Interactive theme toggle button in top navigation bar.

---

## 🛠 Tech Stack

| Component | Technology |
|---|---|
| **Frontend** | React 18, Material UI (MUI v5), Bootstrap Icons, Axios |
| **Backend** | Java 17, Spring Boot 3, Spring Security, Spring Data JPA |
| **Database** | MySQL 8.0 |
| **Security** | JJWT (JSON Web Token), BCrypt |
| **Reporting** | OpenPDF, Apache POI |
| **DevOps** | Docker, Docker Compose, Maven |

---

## 🚀 Quick Start Guide

### Prerequisites
* Java 17 or higher
* Node.js 18+ & npm
* MySQL 8.0 running locally on port 3306

### 1. Database Setup
Create the MySQL database named `ems_db`:
```sql
CREATE DATABASE ems_db;
```
Import `schema.sql`:
```bash
mysql -u root -p ems_db < schema.sql
```

### 2. Run Backend (Spring Boot)
Update database credentials in `src/main/resources/application.properties` if needed:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ems_db?allowPublicKeyRetrieval=true&useSSL=false
spring.datasource.username=root
spring.datasource.password=Harini@123
```
Run the application:
```bash
./mvnw spring-boot:run
```
* **API Base URL**: `http://localhost:8080/api`
* **Swagger API Docs**: `http://localhost:8080/swagger-ui.html`

### 3. Run Frontend (React)
```bash
cd frontend
npm install
npm start
```
* **Web App URL**: `http://localhost:3000`

---

## 🐳 Docker Deployment

Run the entire application (MySQL + Spring Boot + React) with Docker Compose:

```bash
docker-compose up --build -d
```
To stop the containers:
```bash
docker-compose down
```

---

## 🔑 Demo Credentials

| Role | Username | Password |
|---|---|---|
| **Admin** | `admin` | `admin123` |
| **Employee** | `harini` | `password123` |

---

## 🔗 Key API Endpoints

| Method | Endpoint | Description | Role |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate & get JWT token | Public |
| `POST` | `/api/auth/register` | Register new user | Public |
| `GET` | `/api/employees` | Get employee list | Authenticated |
| `POST` | `/api/employees` | Create employee | Admin |
| `POST` | `/api/upload/profile-image` | Upload profile avatar | Authenticated |
| `GET` | `/api/projects` | Get all projects | Authenticated |
| `POST` | `/api/projects/{id}/assign` | Assign employees to project | Admin |
| `PATCH` | `/api/tasks/{id}/status` | Update task progress & status | Authenticated |
| `POST` | `/api/attendance/check-in` | 1-Click attendance check-in | Authenticated |
| `GET` | `/api/reports/tasks/pdf` | Export tasks PDF report | Authenticated |
| `GET` | `/api/reports/tasks/excel` | Export tasks Excel dataset | Authenticated |

---

## 👩‍💻 Author

* **Harini Maliga** - *Java Full Stack Developer*
* GitHub: [@Harinimaliga](https://github.com/Harinimaliga)
