import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, 
  Mic, 
  Headphones, 
  LogOut, 
  ShieldCheck, 
  Stethoscope,
  User,
  Bell,
  Menu,
  X,
  BookOpen,
  MessageSquare,
  ChevronDown,
  HeartPulse,
  Brain,
  Wind,
  Apple,
  Pill
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAudioPlayer } from '../../context/AudioContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const { openLexicon } = useAudioPlayer();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const NAV_CATEGORIES = [
    { id: 'TIM_MACH', name: 'Tim Mạch & Huyết Áp', icon: HeartPulse, color: 'text-rose-600' },
    { id: 'THAN_KINH', name: 'Thần Kinh & Đột Quỵ', icon: Brain, color: 'text-purple-600' },
    { id: 'TIEU_HOA', name: 'Tiêu Hóa & Dạ Dày', icon: Stethoscope, color: 'text-orange-600' },
    { id: 'HO_HAP', name: 'Hô Hấp & Bệnh Theo Mùa', icon: Wind, color: 'text-sky-600' },
    { id: 'DINH_DUONG', name: 'Dinh Dưỡng & Lối Sống', icon: Apple, color: 'text-emerald-600' },
    { id: 'DUOC_PHAM', name: 'Thuốc & Dược Liệu', icon: Pill, color: 'text-teal-600' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-teal-800 flex items-center justify-center text-white font-bold shadow-xs group-hover:bg-teal-900 transition-colors">
            <Activity className="w-5 h-5 text-teal-100 group-hover:scale-105 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                Health<span className="text-teal-700">Voice</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200/80 rounded-md">
                Y Khoa Số
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
              Nền Tảng Podcast &amp; Trợ Lý Y Khoa AI
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 t-btn-press ${
              isActive('/') || isActive('/podcasts') || isActive('/patient/podcasts')
                ? 'bg-teal-50 text-teal-950 border border-teal-200/90 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Headphones className="w-4 h-4 text-teal-700" />
            Thư Viện Podcast
          </Link>

          {/* Menu Dropdown 6 Chuyên Khoa Y Tế */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              onMouseEnter={() => setCategoryDropdownOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 t-btn-press ${
                location.pathname.startsWith('/category')
                  ? 'bg-teal-50 text-teal-950 border border-teal-200/90 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <BookOpen className="w-4 h-4 text-teal-700" />
              <span>Chuyên Khoa Y Tế</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {categoryDropdownOpen && (
              <div 
                onMouseLeave={() => setCategoryDropdownOpen(false)}
                className="absolute left-0 mt-1.5 w-68 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  6 Chuyên Khoa Trọng Điểm
                </div>
                <div className="p-1 space-y-0.5">
                  {NAV_CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const isCurrent = location.pathname === `/category/${cat.id}`;
                    return (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.id}`}
                        onClick={() => setCategoryDropdownOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                          isCurrent 
                            ? 'bg-teal-50 text-teal-950 font-bold border border-teal-200/60' 
                            : 'text-slate-700 hover:bg-slate-50 hover:text-teal-900'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                          <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                        </div>
                        <span className="truncate">{cat.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Link
            to="/patient"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 t-btn-press ${
              isActive('/patient') 
                ? 'bg-teal-50 text-teal-950 border border-teal-200/90 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-teal-700" />
            Tư Vấn Sức Khỏe AI
          </Link>

          <Link
            to="/reminders"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 t-btn-press ${
              isActive('/reminders') 
                ? 'bg-teal-50 text-teal-950 border border-teal-200/90 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Bell className="w-4 h-4 text-teal-700" />
            Lịch Nhắc Thuốc
          </Link>

          {(hasRole(['DOCTOR']) || hasRole(['ADMIN'])) && (
            <Link
              to="/doctor"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 t-btn-press ${
                isActive('/doctor') || isActive('/studio')
                  ? 'bg-teal-50 text-teal-950 border border-teal-200/90 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-teal-700" />
              Doctor Portal
            </Link>
          )}

          {hasRole(['ADMIN']) && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 t-btn-press ${
                isActive('/admin') 
                  ? 'bg-amber-50 text-amber-950 border border-amber-200/90 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              Quản Trị Admin
            </Link>
          )}
        </nav>

        {/* User Auth controls */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                {hasRole(['ADMIN']) ? (
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                ) : hasRole(['DOCTOR']) ? (
                  <Stethoscope className="w-4 h-4 text-teal-700 shrink-0" />
                ) : (
                  <User className="w-4 h-4 text-slate-600 shrink-0" />
                )}
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900 line-clamp-1 max-w-[140px]">{user?.fullName || user?.username}</p>
                  <p className="text-[10px] mt-0.5">
                    {hasRole(['ADMIN']) ? (
                      <span className="text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded font-semibold border border-amber-200">Quản Trị Viên</span>
                    ) : hasRole(['DOCTOR']) ? (
                      <span className="text-teal-800 bg-teal-100/80 px-1.5 py-0.5 rounded font-semibold border border-teal-200">Bác Sĩ Chuyên Khoa</span>
                    ) : (
                      <span className="text-slate-700 bg-slate-200/70 px-1.5 py-0.5 rounded font-medium border border-slate-300">Bệnh Nhân / Độc Giả</span>
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Đăng xuất"
                className="p-2 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition t-btn-press"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-teal-800 transition t-btn-press"
              >
                Đăng Nhập
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 text-xs sm:text-sm font-semibold bg-teal-800 text-white rounded-lg hover:bg-teal-900 transition shadow-xs t-btn-press"
              >
                Đăng Ký
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg t-btn-press"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1.5">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 p-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <Headphones className="w-4 h-4 text-teal-700" />
            Thư Viện Podcast
          </Link>

          {/* 6 Chuyên khoa trên Mobile */}
          <div className="py-1 border-y border-slate-100 my-1">
            <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Chuyên Khoa Y Tế
            </p>
            <div className="grid grid-cols-2 gap-1">
              {NAV_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-1.5 p-1.5 rounded-md text-xs text-slate-700 hover:bg-slate-100"
                  >
                    <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                    <span className="truncate">{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <Link
            to="/patient"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 p-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <MessageSquare className="w-4 h-4 text-teal-700" />
            Tư Vấn Sức Khỏe AI
          </Link>
          <Link
            to="/reminders"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 p-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <Bell className="w-4 h-4 text-teal-700" />
            Lịch Nhắc Thuốc
          </Link>
          {(hasRole(['DOCTOR']) || hasRole(['ADMIN'])) && (
            <Link
              to="/studio"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Stethoscope className="w-4 h-4 text-teal-700" />
              Bác Sĩ Studio
            </Link>
          )}
          {hasRole(['ADMIN']) && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              Quản Trị Admin
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              openLexicon && openLexicon();
            }}
            className="w-full flex items-center gap-2 p-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 text-left"
          >
            <BookOpen className="w-4 h-4 text-slate-500" />
            Từ Điển Thuật Ngữ Y Khoa
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
