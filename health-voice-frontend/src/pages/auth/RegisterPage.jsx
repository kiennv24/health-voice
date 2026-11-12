import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'PATIENT',
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên.';
    if (!form.email.trim()) newErrors.email = 'Vui lòng nhập email.';
    else if (!validateEmail(form.email)) newErrors.email = 'Email không đúng định dạng.';
    if (!form.username.trim()) newErrors.username = 'Vui lòng nhập tên đăng nhập.';
    else if (form.username.length < 4) newErrors.username = 'Tên đăng nhập phải ít nhất 4 ký tự.';
    if (!form.password) newErrors.password = 'Vui lòng nhập mật khẩu.';
    else if (form.password.length < 8) newErrors.password = 'Mật khẩu phải ít nhất 8 ký tự.';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    setServerError('');
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        username: form.username,
        password: form.password,
        role: form.role,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login', { state: { registered: true } }), 2000);
    } catch (err) {
      const msg = err?.response?.data?.message || '';
      if (msg.toLowerCase().includes('username')) setServerError('Tên đăng nhập đã được sử dụng.');
      else if (msg.toLowerCase().includes('email')) setServerError('Email đã được sử dụng.');
      else setServerError('Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-sm p-8">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-teal-700 flex items-center justify-center rounded-md">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-slate-900 font-bold text-lg">Health Voice</span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-1">Tạo tài khoản</h2>
        <p className="text-slate-500 text-sm mb-6">Điền thông tin để đăng ký tài khoản mới</p>

        {success && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md px-4 py-3 mb-5 text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>Đăng ký thành công! Đang chuyển đến trang đăng nhập...</span>
          </div>
        )}

        {serverError && (
          <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-md px-4 py-3 mb-5 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Họ tên */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
            <input
              type="text" name="fullName" value={form.fullName} onChange={handleChange}
              placeholder="Nguyễn Văn A"
              className={`w-full border rounded-md px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent ${errors.fullName ? 'border-rose-400' : 'border-slate-300'}`}
            />
            {errors.fullName && <p className="text-rose-600 text-xs mt-1">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email" name="email" value={form.email} onChange={handleChange}
              placeholder="example@email.com"
              className={`w-full border rounded-md px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent ${errors.email ? 'border-rose-400' : 'border-slate-300'}`}
            />
            {errors.email && <p className="text-rose-600 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tên đăng nhập</label>
            <input
              type="text" name="username" value={form.username} onChange={handleChange}
              placeholder="Tối thiểu 4 ký tự"
              className={`w-full border rounded-md px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent ${errors.username ? 'border-rose-400' : 'border-slate-300'}`}
            />
            {errors.username && <p className="text-rose-600 text-xs mt-1">{errors.username}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                placeholder="Tối thiểu 8 ký tự"
                className={`w-full border rounded-md px-3 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent ${errors.password ? 'border-rose-400' : 'border-slate-300'}`}
              />
              <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-rose-600 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Xác nhận mật khẩu</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                className={`w-full border rounded-md px-3 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent ${errors.confirmPassword ? 'border-rose-400' : 'border-slate-300'}`}
              />
              <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-rose-600 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Vai trò */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vai trò</label>
            <select
              name="role" value={form.role} onChange={handleChange}
              className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            >
              <option value="PATIENT">Bệnh nhân</option>
              <option value="DOCTOR">Bác sĩ</option>
            </select>
          </div>

          <button
            type="submit" disabled={loading || success}
            className="w-full bg-teal-800 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-md text-sm transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Đang đăng ký...
              </>
            ) : 'Đăng ký'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-teal-700 font-medium hover:text-teal-800">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
