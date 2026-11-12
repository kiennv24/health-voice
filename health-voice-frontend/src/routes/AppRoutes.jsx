import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Pages
import DoctorStudio from '../pages/DoctorStudio';
import DoctorPortal from '../pages/doctor/DoctorPortal';
import AdminDashboard from '../pages/admin/AdminDashboard';
import PatientDashboard from '../pages/patient/PatientDashboard';
import HealthRemindersPage from '../pages/HealthRemindersPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import PodcastFeedPage from '../pages/podcast/PodcastFeedPage';
import PodcastDetailPage from '../pages/podcast/PodcastDetailPage';
import CategoryDetailPage from '../pages/podcast/CategoryDetailPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Tuyến đường công cộng (Public Routes): Thư Viện Podcast & Bản Tin Sức Khỏe là trang chính */}
      <Route path="/" element={<PodcastFeedPage />} />
      <Route path="/podcasts" element={<PodcastFeedPage />} />
      <Route path="/category/:categoryCode" element={<CategoryDetailPage />} />
      <Route path="/podcasts/category/:categoryCode" element={<CategoryDetailPage />} />
      <Route path="/podcasts/:slug" element={<PodcastDetailPage />} />
      <Route path="/patient/podcasts" element={<PodcastFeedPage />} />
      <Route path="/patient/podcasts/:slug" element={<PodcastDetailPage />} />
      <Route path="/article/:id" element={<PodcastDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* 2. Tuyến đường Bệnh nhân: Tư vấn Sức khỏe & Trợ lý Giọng nói AI */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />

      {/* 3. Tính năng Lịch nhắc nhở thông minh */}
      <Route path="/reminders" element={<HealthRemindersPage />} />

      {/* 4. Tuyến đường dành cho Bác sĩ (Doctor Portal & Doctor Studio) */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
            <DoctorPortal />
          </ProtectedRoute>
        }
      />
      <Route path="/studio" element={<Navigate to="/doctor" replace />} />

      {/* 5. Tuyến đường dành cho Quản trị viên (Admin Portal) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* 6. Trang 404 Not Found */}
      <Route
        path="*"
        element={
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
            <h1 className="text-6xl font-extrabold text-teal-800">404</h1>
            <p className="text-slate-600 text-sm max-w-sm">
              Trang bạn tìm kiếm không tồn tại hoặc đã được di chuyển.
            </p>
            <a 
              href="/" 
              className="px-5 py-2.5 bg-teal-800 text-white rounded-md text-xs font-bold shadow-xs hover:bg-teal-900 transition"
            >
              Trở về Trang Chủ
            </a>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
