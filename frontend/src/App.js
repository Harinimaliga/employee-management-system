import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import EmployeeFormPage from './pages/EmployeeFormPage';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage from './pages/TasksPage';
import ReportsPage from './pages/ReportsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import SwaggerPage from './pages/SwaggerPage';
import SettingsPage from './pages/SettingsPage';
import AttendancePage from './pages/AttendancePage';
import ShiftManagementPage from './pages/ShiftManagementPage';
import ProfilePage from './pages/ProfilePage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <PrivateRoute requiredRole="ROLE_ADMIN">
                <EmployeesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/employees/add"
            element={
              <PrivateRoute requiredRole="ROLE_ADMIN">
                <EmployeeFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/employees/edit/:id"
            element={
              <PrivateRoute requiredRole="ROLE_ADMIN">
                <EmployeeFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <PrivateRoute>
                <AttendancePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/shifts"
            element={
              <PrivateRoute>
                <ShiftManagementPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <PrivateRoute>
                <ProjectsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <TasksPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <ReportsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <PrivateRoute requiredRole="ROLE_ADMIN">
                <AuditLogsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/swagger"
            element={
              <PrivateRoute requiredRole="ROLE_ADMIN">
                <SwaggerPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
