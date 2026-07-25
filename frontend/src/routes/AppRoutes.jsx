import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth Route Guards
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Layouts
import StudentLayout from '../components/layout/StudentLayout';
import StaffLayout from '../components/layout/StaffLayout';
import AdminLayout from '../components/layout/AdminLayout';

// Public Pages
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import VerifyOTP from '../pages/auth/VerifyOTP';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import Unauthorized from '../pages/Unauthorized';
import NotFound from '../pages/NotFound';

// Student Portal Pages
import StudentDashboard from '../pages/student/Dashboard';
import StudentCreateRequest from '../pages/student/CreateRequest';
import StudentMyRequests from '../pages/student/MyRequests';
import StudentComplaints from '../pages/student/Complaints';
import StudentFeedback from '../pages/student/Feedback';
import StudentNotifications from '../pages/student/Notifications';
import StudentProfile from '../pages/student/Profile';

// Staff Portal Pages
import StaffDashboard from '../pages/staff/Dashboard';
import StaffHistory from '../pages/staff/History';
import StaffFeedback from '../pages/staff/Feedback';
import StaffNotifications from '../pages/staff/Notifications';
import StaffProfile from '../pages/staff/Profile';

// Admin Portal Pages
import AdminDashboard from '../pages/admin/Dashboard';
import AdminStudents from '../pages/admin/Students';
import AdminStaff from '../pages/admin/Staff';
import AdminBlocks from '../pages/admin/Blocks';
import AdminServiceTypes from '../pages/admin/ServiceTypes';
import AdminRequests from '../pages/admin/Requests';
import AdminComplaints from '../pages/admin/Complaints';
import AdminFeedback from '../pages/admin/Feedback';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Student Portal Protected Guard */}
      <Route element={<RoleRoute allowedRoles={['STUDENT']} />}>
        <Route
          path="/student/*"
          element={
            <StudentLayout>
              <Routes>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="services" element={<StudentCreateRequest />} />
                <Route path="history" element={<StudentMyRequests />} />
                <Route path="complaints" element={<StudentComplaints />} />
                <Route path="feedback" element={<StudentFeedback />} />
                <Route path="notifications" element={<StudentNotifications />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </StudentLayout>
          }
        />
      </Route>

      {/* Staff Portal Protected Guard */}
      <Route element={<RoleRoute allowedRoles={['STAFF']} />}>
        <Route
          path="/staff/*"
          element={
            <StaffLayout>
              <Routes>
                <Route path="dashboard" element={<StaffDashboard />} />
                <Route path="history" element={<StaffHistory />} />
                <Route path="feedback" element={<StaffFeedback />} />
                <Route path="notifications" element={<StaffNotifications />} />
                <Route path="profile" element={<StaffProfile />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </StaffLayout>
          }
        />
      </Route>

      {/* Admin Portal Protected Guard */}
      <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
        <Route
          path="/admin/*"
          element={
            <AdminLayout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="staff" element={<AdminStaff />} />
                <Route path="blocks" element={<AdminBlocks />} />
                <Route path="service-types" element={<AdminServiceTypes />} />
                <Route path="requests" element={<AdminRequests />} />
                <Route path="complaints" element={<AdminComplaints />} />
                <Route path="feedback" element={<AdminFeedback />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </AdminLayout>
          }
        />
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}