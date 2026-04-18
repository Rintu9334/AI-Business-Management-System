import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import UnifiedDashboard from './pages/UnifiedDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import UserDirectory from './pages/UserDirectory'; 
import ManagerDashboard from './pages/ManagerDashboard';
import AIInsights from './pages/AIInsights';
import ReportsPage from './pages/ReportsPage';
import TasksPage from './pages/TasksPage';
import AttendancePage from './pages/AttendancePage';
import PerformancePage from './pages/PerformancePage';
import NotificationsPage from './pages/NotificationsPage';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/index.css';

function App() {
  return (
    <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserDirectory />
            </ProtectedRoute>
          } />

          {/* Manager Routes */}
          <Route path="/manager/dashboard" element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <UnifiedDashboard />
            </ProtectedRoute>
          } />

          <Route path="/manager/overview" element={<Navigate to="/manager/dashboard" replace />} />
          
          <Route path="/manager/projects" element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <ManagerDashboard /> 
            </ProtectedRoute>
          } />

          <Route path="/manager/tasks" element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <TasksPage /> 
            </ProtectedRoute>
          } />

          <Route path="/manager" element={<Navigate to="/manager/dashboard" replace />} />
          
          {/* Employee Routes */}
          <Route path="/employee/dashboard" element={
            <ProtectedRoute allowedRoles={['employee', 'admin', 'manager']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />

          <Route path="/employee" element={<Navigate to="/employee/dashboard" replace />} />

          <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
          <Route path="/performance" element={<ProtectedRoute><PerformancePage /></ProtectedRoute>} />
          <Route path="/ai" element={<ProtectedRoute><AIInsights /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><ReportsPage /></ProtectedRoute>} />
          
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          
          {/* Default Navigation Core */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    </Router>
  );
}

export default App;
