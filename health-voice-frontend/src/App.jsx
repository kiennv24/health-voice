import React, { useRef, useEffect } from 'react';
import { BrowserRouter, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AudioProvider, useAudioPlayer } from './context/AudioContext';
import Navbar from './components/common/Navbar';
import AppRoutes from './routes/AppRoutes';
import GlobalAudioPlayer from './components/audio/GlobalAudioPlayer';
import AudioDetailModal from './components/audio/AudioDetailModal';
import MedicalLexiconModal from './components/common/MedicalLexiconModal';
import MedicationAlarmTracker from './components/reminders/MedicationAlarmTracker';
import ErrorBoundary from './components/common/ErrorBoundary';
import { Activity, ShieldCheck, HeartPulse, PhoneCall, Stethoscope, BookOpen, Sparkles } from 'lucide-react';

function AppLayout() {
  const location = useLocation();
  const { stopAll } = useAudioPlayer();
  const prevPathRef = useRef(location.pathname);

  // Khi người dùng chuyển sang trang khác hoặc thoát ra khỏi bài viết, tự động tắt toàn bộ âm thanh
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      stopAll();
      prevPathRef.current = location.pathname;
    }
  }, [location.pathname, stopAll]);

  // Ẩn Footer trên giao diện tư vấn toàn màn hình của Bệnh nhân
  const isFullScreenChat = location.pathname.startsWith('/patient');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-900 font-sans selection:bg-teal-700 selection:text-white">
      {/* Header điều hướng y tế */}
      <Navbar />

      {/* Bộ giám sát & Báo thức lịch uống thuốc thông minh (Tự động canh giờ & Bật Popup + Giọng đọc Y Khoa) */}
      <MedicationAlarmTracker />

      {/* Nội dung trang theo định tuyến */}
      <main className="flex-1 flex flex-col">
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </main>

      {/* Trình phát Podcast toàn cục ghim cố định đáy màn hình (Global Bottom Audio Player) */}
      <GlobalAudioPlayer />

      {/* Hộp thoại chi tiết kịch bản & đối chiếu ngữ âm y khoa */}
      <AudioDetailModal />

      {/* Hộp thoại tra cứu quy chuẩn thuật ngữ y khoa */}
      <MedicalLexiconModal />

      {/* Footer Nền Tảng Y Khoa Toàn Diện (Phong cách Cổng Thông Tin Sức Khỏe Quốc Tế) */}
      {!isFullScreenChat && (
        <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 mt-20 pt-16 pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-800/80">
              {/* Cột 1: Thương hiệu & Sứ mệnh */}
              <div className="space-y-4 lg:col-span-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-lg tracking-tight text-white">
                      Health <span className="text-teal-400">Voice</span>
                    </span>
                    <span className="ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-teal-900 text-teal-300 border border-teal-700/60 rounded">
                      Medical Voice
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                  Cổng thông tin sức khỏe đa phương tiện và Trợ lý Y khoa Số. Đồng hành cùng Hội đồng Bác sĩ chuyên khoa mang tri thức y học chính thống đến từng người bệnh qua giọng đọc AI truyền cảm, chuẩn hóa 100% ngữ âm tiếng Việt.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-teal-300 font-medium">
                    ✓ Kiểm định lâm sàng
                  </span>
                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-teal-300 font-medium">
                    ✓ Triage Cấp cứu 115
                  </span>
                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-teal-300 font-medium">
                    ✓ Chuẩn hóa âm thanh lâm sàng
                  </span>
                </div>
              </div>

              {/* Cột 2: Dịch Vụ Sức Khỏe */}
              <div className="space-y-3 text-xs">
                <p className="font-bold text-white uppercase tracking-wider text-[11px]">Dịch Vụ Sức Khỏe Số</p>
                <ul className="space-y-2 text-slate-400">
                  <li>
                    <Link to="/patient" className="hover:text-teal-300 transition">
                      Tư Vấn Sức Khỏe AI (Triage 4 Tầng)
                    </Link>
                  </li>
                  <li>
                    <a href="#podcast-library" className="hover:text-teal-300 transition">
                      Thư Viện Podcast Y Khoa
                    </a>
                  </li>
                  <li>
                    <Link to="/reminders" className="hover:text-teal-300 transition">
                      Lịch Nhắc Thuốc Thông Minh
                    </Link>
                  </li>
                  <li>
                    <a href="#health-tools" className="hover:text-teal-300 transition">
                      Tiện Ích Tính BMI &amp; Huyết Áp
                    </a>
                  </li>
                  <li>
                    <Link to="/doctor" className="hover:text-teal-300 transition">
                      Doctor Portal &amp; Xuất Bản
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Cột 3: Chuyên Khoa Trọng Điểm */}
              <div className="space-y-3 text-xs">
                <p className="font-bold text-white uppercase tracking-wider text-[11px]">Chuyên Khoa Trọng Điểm</p>
                <ul className="space-y-2 text-slate-400">
                  <li>Đột Quỵ &amp; Cấp Cứu Não FAST</li>
                  <li>Tim Mạch &amp; Kiểm Soát Huyết Áp</li>
                  <li>Nhi Khoa &amp; Chăm Sóc Sốt Trẻ Em</li>
                  <li>Nội Tiết &amp; Đái Tháo Đường</li>
                  <li>Dược Lâm Sàng &amp; An Toàn Đơn Thuốc</li>
                  <li>Cơ Xương Khớp &amp; Vận Động</li>
                </ul>
              </div>

              {/* Cột 4: Hỗ Trợ Khẩn Cấp & Chứng Nhận */}
              <div className="space-y-3 text-xs">
                <p className="font-bold text-white uppercase tracking-wider text-[11px]">Đường Dây Nóng Khẩn Cấp</p>
                <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-rose-300 text-sm">
                    <PhoneCall className="w-4 h-4 text-rose-400 animate-pulse" />
                    <span>CẤP CỨU Y TẾ: 115</span>
                  </div>
                  <p className="text-[11px] text-rose-300/80 leading-normal">
                    Khi người bệnh đau thắt ngực dữ dội, méo miệng, liệt tay chân hoặc khó thở cấp tính, gọi ngay 115.
                  </p>
                </div>

                <div className="pt-1 text-[11px] text-slate-400">
                  <span className="block font-semibold text-slate-300">Hệ thống âm thanh y tế:</span>
                  Giọng đọc chuẩn y khoa truyền cảm, phiên âm chính xác tên thuốc &amp; chỉ số.
                </div>
              </div>
            </div>

            {/* Disclaimer & Copyright */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <p className="text-[11px] text-center sm:text-left leading-relaxed max-w-3xl">
                <strong className="text-slate-300 font-semibold">Tuyên bố miễn trừ trách nhiệm y tế:</strong> Thông tin và âm thanh trên Health Voice nhằm mục đích giáo dục sức khỏe cộng đồng và nâng cao nhận thức phòng ngừa bệnh. Nội dung không thay thế cho việc chẩn đoán lâm sàng, chỉ định xét nghiệm hoặc phác đồ điều trị trực tiếp từ Bác sĩ có chứng chỉ hành nghề.
              </p>
              <div className="text-[11px] font-mono text-center sm:text-right shrink-0">
                <p>© 2026 Health Voice System.</p>
                <p className="text-slate-400 text-[10px]">All medical rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AudioProvider>
          <AppLayout />
        </AudioProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
