import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Shield, Mic, FileText, Star, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const FEATURES = [
  { icon: Mic, text: 'Tổng hợp giọng đọc y khoa truyền cảm, tự nhiên' },
  { icon: FileText, text: 'Thư viện Podcast & Bản tin y khoa chuẩn lâm sàng' },
  { icon: Shield, text: 'Bảo mật dữ liệu y tế theo chuẩn an toàn' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim()) { setError('Vui lòng nhập tên đăng nhập.'); return; }
    if (!form.password) { setError('Vui lòng nhập mật khẩu.'); return; }

    setLoading(true);
    setError('');
    try {
      const user = await login(form);
      if (user?.role === 'ADMIN') navigate('/admin');
      else if (user?.role === 'DOCTOR') navigate('/doctor');
      else navigate('/patient');
    } catch (err) {
      console.error('Chi tiết lỗi đăng nhập:', err);
      const serverMsg = err?.response?.data?.message || err?.message || '';
      if (
        err?.response?.status === 400 || 
        err?.response?.status === 401 || 
        serverMsg.includes('không chính xác') || 
        serverMsg.toLowerCase().includes('credentials')
      ) {
        setError(serverMsg || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
      } else if (err?.response?.status === 403 || serverMsg.includes('bị khóa')) {
        setError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
      } else if (err?.response) {
        setError(serverMsg || 'Đăng nhập không thành công. Vui lòng thử lại.');
      } else {
        setError('Không thể kết nối đến máy chủ Backend (Port 8080). Vui lòng kiểm tra lại dịch vụ.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Cột trái — Branding */}
      <div className="hidden lg:flex lg:w-5/12 bg-slate-900 flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-teal-700 flex items-center justify-center rounded-md">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xl font-bold tracking-wide">Health Voice</span>
          </div>

          <h1 className="text-white text-3xl font-bold leading-tight mb-4">
            Hệ thống Tư vấn Sức khoẻ <br />
            <span className="text-teal-400">bằng giọng nói </span>
          </h1>
          <p className="text-slate-400 text-base mb-10 leading-relaxed">
            Nền tảng tổng hợp giọng nói tiếng Việt chuyên ngành y tế, giúp bác sĩ truyền đạt thông tin điều trị rõ ràng và tự nhiên hơn.
          </p>

          <ul className="space-y-5">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-teal-900 border border-teal-700 flex items-center justify-center rounded-md flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-teal-400" />
                </div>
                <span className="text-slate-300 text-sm leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-slate-600 text-xs">
          © 2026 HealthVoice 2.0 — Đồ án tốt nghiệp
        </p>
      </div>

      {/* Cột phải — Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-teal-700 flex items-center justify-center rounded-md">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-900 font-bold text-lg">Health Voice</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Đăng nhập</h2>
          <p className="text-slate-500 text-sm mb-8">Nhập thông tin tài khoản để tiếp tục</p>

          {error && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-md px-4 py-3 mb-6 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Tên đăng nhập
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập"
                autoComplete="username"
                className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  className="w-full border border-slate-300 rounded-md px-3 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-800 hover:bg-teal-700 disabled:bg-teal-900 disabled:opacity-60 text-white font-semibold py-2.5 rounded-md text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Đang đăng nhập...
                </>
              ) : 'Đăng nhập'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-teal-700 font-medium hover:text-teal-800">
              Đăng ký ngay
            </Link>
          </p>

          {/* Tài khoản mẫu trải nghiệm nhanh */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
              Tài khoản mẫu trải nghiệm (Mật khẩu: 123456)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setForm({ username: 'kiennv', password: 'password123' === '' ? '' : '123456' })}
                className="p-2 text-center rounded-md border border-slate-200 hover:border-teal-600 hover:bg-teal-50 transition text-xs font-medium text-slate-700 hover:text-teal-900"
              >
                👤 Bệnh nhân<br /><span className="text-[10px] text-slate-400 font-mono">kiennv</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ username: 'bs_nguyentuanminh', password: '123456' })}
                className="p-2 text-center rounded-md border border-slate-200 hover:border-teal-600 hover:bg-teal-50 transition text-xs font-medium text-slate-700 hover:text-teal-900"
              >
                🩺 Bác sĩ<br /><span className="text-[10px] text-slate-400 font-mono">bs_nguyentuanminh</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ username: 'admin', password: '123456' })}
                className="p-2 text-center rounded-md border border-slate-200 hover:border-teal-600 hover:bg-teal-50 transition text-xs font-medium text-slate-700 hover:text-teal-900"
              >
                🛡️ Quản trị<br /><span className="text-[10px] text-slate-400 font-mono">admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
