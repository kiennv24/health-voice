import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Component bảo vệ tuyến đường theo Role (ADMIN, DOCTOR, LISTENER)
 * @param {Object} props
 * @param {string[]} props.allowedRoles - Danh sách role được phép truy cập
 * @param {React.ReactNode} props.children
 */
export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { isAuthenticated, user, hasRole, loading } = useAuth();
  const location = useLocation();

  // Đang khôi phục session đăng nhập từ LocalStorage
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-8 h-8 border-3 border-teal-800 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Đang tải thông tin xác thực...</p>
      </div>
    );
  }

  // 1. Chưa đăng nhập -> Chuyển hướng sang /login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Nếu có yêu cầu role cụ thể mà user không có -> Chuyển về trang mặc định hoặc thông báo 403
  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    const roleMap = {
      ADMIN: 'Quản Trị Viên (ROLE_ADMIN)',
      DOCTOR: 'Bác Sĩ Chuyên Khoa (ROLE_DOCTOR)',
      LISTENER: 'Bệnh Nhân / Người Nghe (ROLE_LISTENER)',
    };

    const readableRequired = allowedRoles.map(r => roleMap[r.toUpperCase()] || r).join(' hoặc ');
    const userRoleStr = user?.role ? (roleMap[user.role.replace(/^ROLE_/, '').toUpperCase()] || user.role) : 'Chưa xác định';

    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 bg-rose-50 text-rose-700 rounded-lg flex items-center justify-center font-bold text-xl mb-4 border border-rose-200">
          403
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Từ Chối Truy Cập (Forbidden)</h2>
        <p className="text-slate-600 text-sm max-w-lg mb-2">
          Khu vực này yêu cầu đặc quyền: <strong className="text-rose-700">{readableRequired}</strong>.
        </p>
        <p className="text-slate-500 text-xs mb-6">
          Tài khoản hiện tại của bạn: <strong>{user?.fullName || user?.username}</strong> ({userRoleStr}).
        </p>
        <div className="flex items-center gap-3">
          <a 
            href="/" 
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold hover:bg-slate-200 transition border border-slate-300"
          >
            ← Về Thư Viện Podcast
          </a>
          <a 
            href="/login" 
            className="px-4 py-2 bg-teal-800 text-white rounded-md text-xs font-semibold hover:bg-teal-900 transition"
          >
            Đổi Tài Khoản Bác Sĩ / Admin →
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
