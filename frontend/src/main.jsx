import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import './styles/index.css';

// Layouts
import StudentLayout from './layouts/StudentLayout.jsx';
import StaffLayout from './layouts/StaffLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';

// Auth Pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import VerifyOtp from './pages/VerifyOtp.jsx';

// Student Pages
import StudentDashboard from './pages/student/Dashboard.jsx';
import StudentRequests from './pages/student/ServiceRequests.jsx';
import StudentComplaints from './pages/student/Complaints.jsx';
import StudentProfile from './pages/student/Profile.jsx';

// Staff Pages
import StaffDashboard from './pages/staff/Dashboard.jsx';
import StaffRequests from './pages/staff/ServiceRequests.jsx';
import StaffHistory from './pages/staff/History.jsx';
import StaffProfile from './pages/staff/Profile.jsx';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminStudents from './pages/admin/StudentManagement.jsx';
import AdminStaff from './pages/admin/StaffManagement.jsx';
import AdminRequests from './pages/admin/RequestManagement.jsx';
import AdminComplaints from './pages/admin/ComplaintManagement.jsx';
import AdminAnalytics from './pages/admin/Analytics.jsx';
import AdminAuditLogs from './pages/admin/AuditLogs.jsx';
import AdminProfile from './pages/admin/Profile.jsx';

// Redirect helpers
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    const defaultHome = {
      STUDENT: '/student',
      STAFF: '/staff',
      ADMINISTRATOR: '/admin'
    }[user.role];
    return <Navigate to={defaultHome || '/login'} replace />;
  }

  return children;
};

const HomeRedirect = () => {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const defaultHome = {
    STUDENT: '/student',
    STAFF: '/staff',
    ADMINISTRATOR: '/admin'
  }[user.role];

  return <Navigate to={defaultHome || '/login'} replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />

          {/* Protected Student routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="requests" element={<StudentRequests />} />
            <Route path="complaints" element={<StudentComplaints />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* Protected Staff routes */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRole="STAFF">
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StaffDashboard />} />
            <Route path="requests" element={<StaffRequests />} />
            <Route path="history" element={<StaffHistory />} />
            <Route path="profile" element={<StaffProfile />} />
          </Route>

          {/* Protected Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="ADMINISTRATOR">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="requests" element={<AdminRequests />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          {/* Fallbacks */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
