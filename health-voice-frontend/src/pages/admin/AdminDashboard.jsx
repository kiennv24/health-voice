import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  Zap, 
  Clock, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Server,
  Radio,
  FileText,
  Volume2,
  Trash2,
  Sparkles,
  HardDrive,
  Bell,
  MessageSquare,
  Check,
  Play,
  Pause,
  Filter,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { adminApi } from '../../api/endpoints';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'podcasts' | 'users' | 'cache' | 'monitoring'

  // State
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTtsRequests: 0,
    totalCacheEntries: 0,
    totalCacheHits: 0,
    cacheHitRatePercent: 0,
    avgLatencyMs: 350,
    totalPodcasts: 0,
    totalCategories: 0,
    totalConsultations: 0,
    totalReminders: 0,
    totalMessages: 0,
    storageStats: {
      totalFiles: 0,
      totalSizeMb: 0,
    }
  });

  const [userList, setUserList] = useState([]);
  const [cacheList, setCacheList] = useState([]);
  const [podcastList, setPodcastList] = useState([]);
  const [reminderList, setReminderList] = useState([]);
  const [consultationList, setConsultationList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [podcastSearch, setPodcastSearch] = useState('');
  const [podcastCategoryFilter, setPodcastCategoryFilter] = useState('ALL');
  const [toast, setToast] = useState(null);

  // Audio player state in admin
  const [playingAudio, setPlayingAudio] = useState(null);
  const [audioElement, setAudioElement] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [resStats, resUsers, resCache, resPodcasts, resReminders, resConsultations] = await Promise.allSettled([
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getCacheStats(),
        adminApi.getPodcasts(),
        adminApi.getReminders(),
        adminApi.getConsultations(),
      ]);

      if (resStats.status === 'fulfilled' && resStats.value?.data?.data) {
        setStats(resStats.value.data.data);
      } else if (resStats.status === 'fulfilled' && resStats.value?.data) {
        setStats(resStats.value.data);
      }

      if (resUsers.status === 'fulfilled' && resUsers.value?.data?.data) {
        setUserList(resUsers.value.data.data);
      } else if (resUsers.status === 'fulfilled' && resUsers.value?.data) {
        setUserList(resUsers.value.data);
      }

      if (resCache.status === 'fulfilled' && resCache.value?.data?.data) {
        setCacheList(resCache.value.data.data);
      } else if (resCache.status === 'fulfilled' && resCache.value?.data) {
        setCacheList(resCache.value.data);
      }

      if (resPodcasts.status === 'fulfilled' && resPodcasts.value?.data?.data) {
        setPodcastList(resPodcasts.value.data.data);
      } else if (resPodcasts.status === 'fulfilled' && resPodcasts.value?.data) {
        setPodcastList(resPodcasts.value.data);
      }

      if (resReminders.status === 'fulfilled' && resReminders.value?.data?.data) {
        setReminderList(resReminders.value.data.data);
      }

      if (resConsultations.status === 'fulfilled' && resConsultations.value?.data?.data) {
        setConsultationList(resConsultations.value.data.data);
      }
    } catch (err) {
      console.warn('Lỗi tải dữ liệu quản trị:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, []);

  // Play audio preview
  const handlePlayAudio = (url) => {
    if (!url) return;
    const fullUrl = url.startsWith('http') ? url : `http://localhost:8080${url}`;

    if (playingAudio === fullUrl) {
      if (audioElement) {
        audioElement.pause();
      }
      setPlayingAudio(null);
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }

    const audio = new Audio(fullUrl);
    audio.play();
    audio.onended = () => setPlayingAudio(null);
    audio.onerror = () => {
      showToast('error', 'Không thể phát file âm thanh này.');
      setPlayingAudio(null);
    };
    setAudioElement(audio);
    setPlayingAudio(fullUrl);
  };

  // Thay đổi vai trò người dùng
  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminApi.updateUserRole(userId, newRole);
      showToast('success', `Đã cập nhật vai trò cho người dùng ID ${userId}`);
      loadAllData();
    } catch (err) {
      showToast('error', 'Lỗi cập nhật vai trò: ' + (err.response?.data?.message || err.message));
    }
  };

  // Khóa / Mở khóa tài khoản
  const handleToggleStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 1 ? 0 : 1;
    try {
      await adminApi.updateUserStatus(userId, nextStatus);
      showToast('success', `Đã ${nextStatus === 1 ? 'mở khóa' : 'khóa'} tài khoản ID ${userId}`);
      loadAllData();
    } catch (err) {
      showToast('error', 'Lỗi cập nhật trạng thái: ' + (err.response?.data?.message || err.message));
    }
  };

  // Chuyển đổi trạng thái xuất bản Podcast
  const handleTogglePodcastStatus = async (podcastId, currentStatus) => {
    const nextStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await adminApi.updatePodcastStatus(podcastId, nextStatus);
      showToast('success', `Đã chuyển trạng thái podcast sang ${nextStatus}`);
      loadAllData();
    } catch (err) {
      showToast('error', 'Lỗi cập nhật trạng thái: ' + (err.response?.data?.message || err.message));
    }
  };

  // Xóa Podcast
  const handleDeletePodcast = async (podcastId, title) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa podcast "${title}"?`)) return;
    try {
      await adminApi.deletePodcast(podcastId);
      showToast('success', `Đã xóa podcast "${title}" thành công`);
      loadAllData();
    } catch (err) {
      showToast('error', 'Lỗi khi xóa: ' + (err.response?.data?.message || err.message));
    }
  };

  // Xóa 1 bản ghi cache
  const handleDeleteCacheEntry = async (cacheId) => {
    try {
      await adminApi.deleteCacheEntry(cacheId);
      showToast('success', `Đã xóa bản ghi cache ID ${cacheId}`);
      loadAllData();
    } catch (err) {
      showToast('error', 'Lỗi khi xóa: ' + (err.response?.data?.message || err.message));
    }
  };

  // Xóa toàn bộ Audio Cache
  const handleClearAllCache = async () => {
    if (!window.confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa toàn bộ bộ nhớ đệm âm thanh?')) return;
    try {
      await adminApi.clearAllCache();
      showToast('success', 'Đã làm sạch toàn bộ bộ nhớ đệm âm thanh!');
      loadAllData();
    } catch (err) {
      showToast('error', 'Lỗi khi xóa cache: ' + (err.response?.data?.message || err.message));
    }
  };

  // Dọn dẹp âm thanh mồ côi (Storage Cleanup)
  const handleCleanupStorage = async () => {
    if (!window.confirm('Hệ thống sẽ quét và xóa các file MP3 không còn liên kết với bất kỳ phiên tư vấn, podcast hay lịch nhắc nào. Bạn muốn tiếp tục?')) return;
    setActionLoading(true);
    try {
      const res = await adminApi.cleanupStorage();
      const info = res.data?.data || {};
      showToast('success', `Dọn dẹp thành công: Đã xóa ${info.deletedFilesCount || 0} file rác, giải phóng ${info.freedBytesMb || 0} MB đĩa!`);
      loadAllData();
    } catch (err) {
      showToast('error', 'Lỗi khi dọn dẹp storage: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  // Lọc người dùng
  const filteredUsers = userList.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  // Lọc Podcast
  const filteredPodcasts = podcastList.filter((p) => {
    const q = podcastSearch.toLowerCase();
    const matchesSearch = !q || (p.title && p.title.toLowerCase().includes(q)) || (p.summary && p.summary.toLowerCase().includes(q));
    const matchesCategory = podcastCategoryFilter === 'ALL' || p.category === podcastCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Danh sách chuyên khoa
  const categoriesList = ['ALL', 'TIM_MACH', 'THAN_KINH', 'CO_XUONG_KHOP', 'DINH_DUONG', 'SO_CUU', 'NOI_TIET', 'NHI_KHOA', 'TAI_MUI_HONG'];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-xl text-xs font-semibold shadow-lg transition-all animate-bounce ${
          toast.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Quản Trị Hệ Thống */}
      <div className="bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-900 text-white flex items-center justify-center shadow-md">
                <ShieldCheck className="w-6 h-6 text-teal-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                    Admin System Control Panel
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                    HealthVoice 2.0
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Giám sát toàn diện hệ sinh thái: Podcast Y khoa, Phiên tư vấn AI, Lịch nhắc thuốc &amp; Kho lưu trữ âm thanh
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 overflow-x-auto w-full lg:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition shrink-0 ${
                  activeTab === 'overview' ? 'bg-white text-teal-950 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-teal-700" />
                <span>Tổng quan</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('podcasts')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition shrink-0 ${
                  activeTab === 'podcasts' ? 'bg-white text-teal-950 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-teal-700" />
                <span>Podcast ({podcastList.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition shrink-0 ${
                  activeTab === 'users' ? 'bg-white text-teal-950 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-teal-700" />
                <span>Người dùng ({userList.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cache')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition shrink-0 ${
                  activeTab === 'cache' ? 'bg-white text-teal-950 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-teal-700" />
                <span>Audio Cache &amp; Storage</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('monitoring')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition shrink-0 ${
                  activeTab === 'monitoring' ? 'bg-white text-teal-950 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-teal-700" />
                <span>Tư Vấn &amp; Nhắc Thuốc</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        {/* ================================================================= */}
        {/* TAB 1: TỔNG QUAN TOÀN HỆ THỐNG */}
        {/* ================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Hàng 1: Thẻ thông số chính */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between hover:border-teal-500/50 transition">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng Podcast Y Khoa</p>
                  <p className="text-3xl font-extrabold text-teal-900 mt-1 font-mono">{stats.totalPodcasts || podcastList.length}</p>
                  <span className="text-[10px] text-teal-700 font-semibold">{stats.totalCategories || 6} chuyên khoa y học</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
                  <Radio className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between hover:border-teal-500/50 transition">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tỷ lệ trúng Cache</p>
                  <p className="text-3xl font-extrabold text-teal-900 mt-1 font-mono">{stats.cacheHitRatePercent || 0}%</p>
                  <span className="text-[10px] text-slate-500 font-medium">{stats.totalCacheHits || 0} lượt trúng / {stats.totalCacheEntries || 0} mục</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
                  <Zap className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between hover:border-teal-500/50 transition">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Độ trễ trung bình</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">{stats.avgLatencyMs || 350} ms</p>
                  <span className="text-[10px] text-emerald-700 font-semibold">Tối ưu phản hồi y tế</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between hover:border-teal-500/50 transition">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng người dùng</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">{stats.totalUsers || userList.length}</p>
                  <span className="text-[10px] text-slate-500 font-medium">Bác sĩ, Admin &amp; Bệnh nhân</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-800">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Hàng 2: Thẻ chỉ số phụ (Nhắc thuốc, Tư vấn, Lưu trữ đĩa) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold">Lịch Nhắc Uống Thuốc</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{stats.totalReminders || reminderList.length} lịch nhắc đang kích hoạt</p>
                  <p className="text-[11px] text-slate-400">Đã đồng bộ xóa file âm thanh khi hủy</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold">Phiên Tư Vấn Sức Khỏe AI</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{stats.totalConsultations || consultationList.length} phiên lâm sàng</p>
                  <p className="text-[11px] text-slate-400">{stats.totalMessages || 0} tin nhắn hội thoại âm thanh</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold">Dung Lượng Kho Âm Thanh</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{stats.storageStats?.totalSizeMb || 57.1} MB</p>
                  <p className="text-[11px] text-slate-400">{stats.storageStats?.totalFiles || 41} tệp MP3 (audio_storage)</p>
                </div>
              </div>
            </div>

            {/* Trạng thái kết nối dịch vụ */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Server className="w-4 h-4 text-teal-700" />
                  <span>Trạng thái kết nối Microservices &amp; Cơ sở dữ liệu</span>
                </h2>
                <button
                  type="button"
                  onClick={loadAllData}
                  className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Kiểm tra lại
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">MySQL Database 8.0</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-slate-500 text-[11px]">Cổng: 3306 | DB: health_voice_db</p>
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    KẾT NỐI HOẠT ĐỘNG
                  </span>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Python FastAPI TTS</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-slate-500 text-[11px]">Cổng: 8000 | Edge Neural TTS &amp; FPT.AI</p>
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    SẴN SÀNG PHỤC VỤ
                  </span>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Spring Boot Core Server</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-slate-500 text-[11px]">Cổng: 8080 | Java 21 LTS + Security 6</p>
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    STATELESS JWT ACTIVE
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: QUẢN LÝ THƯ VIỆN PODCAST & BÀI VIẾT Y KHOA */}
        {/* ================================================================= */}
        {activeTab === 'podcasts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Quản lý Thư Viện Podcast ({podcastList.length} bài viết)</h2>
                <p className="text-xs text-slate-500">
                  Theo dõi lượt nghe, trạng thái xuất bản và kiểm duyệt nội dung y khoa
                </p>
              </div>

              {/* Tìm kiếm & Lọc chuyên khoa */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={podcastSearch}
                    onChange={(e) => setPodcastSearch(e.target.value)}
                    placeholder="Tìm tên bài viết podcast..."
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-300 focus:border-teal-700 outline-none"
                  />
                </div>

                <select
                  value={podcastCategoryFilter}
                  onChange={(e) => setPodcastCategoryFilter(e.target.value)}
                  className="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white outline-none cursor-pointer font-medium"
                >
                  <option value="ALL">Tất cả chuyên khoa</option>
                  <option value="TIM_MACH">Tim mạch</option>
                  <option value="THAN_KINH">Thần kinh</option>
                  <option value="CO_XUONG_KHOP">Cơ xương khớp</option>
                  <option value="DINH_DUONG">Dinh dưỡng</option>
                  <option value="SO_CUU">Sơ cứu</option>
                  <option value="NOI_TIET">Nội tiết</option>
                  <option value="NHI_KHOA">Nhi khoa</option>
                </select>
              </div>
            </div>

            {/* Bảng danh sách Podcast */}
            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5 w-12 text-center">ID</th>
                    <th className="p-3.5">Tiêu đề bài viết Podcast</th>
                    <th className="p-3.5">Chuyên khoa</th>
                    <th className="p-3.5">Tác giả</th>
                    <th className="p-3.5 text-center">Lượt nghe</th>
                    <th className="p-3.5 text-center">Trạng thái</th>
                    <th className="p-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPodcasts.map((p) => {
                    const isPlaying = playingAudio === (p.audioUrl?.startsWith('http') ? p.audioUrl : `http://localhost:8080${p.audioUrl}`);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 text-center font-mono text-slate-400 font-bold">{p.id}</td>
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900 max-w-md line-clamp-1">{p.title}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{p.summary}</p>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-700 font-medium">
                          {p.author?.fullName || 'BS. Chuyên Khoa'}
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-teal-800">
                          {p.listenCount || 0}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePodcastStatus(p.id, p.status)}
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border transition ${
                              p.status === 'PUBLISHED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            {p.status === 'PUBLISHED' ? 'Đã Xuất Bản' : 'Bản Nháp'}
                          </button>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {p.audioUrl && (
                              <button
                                type="button"
                                onClick={() => handlePlayAudio(p.audioUrl)}
                                className={`p-1.5 rounded-lg border transition ${
                                  isPlaying 
                                    ? 'bg-teal-700 text-white border-teal-800' 
                                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-teal-50 hover:text-teal-800'
                                }`}
                                title={isPlaying ? 'Dừng phát' : 'Nghe thử âm thanh'}
                              >
                                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                              </button>
                            )}

                            <a
                              href={`/podcasts/${p.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 transition"
                              title="Xem trang chi tiết"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </a>

                            <button
                              type="button"
                              onClick={() => handleDeletePodcast(p.id, p.title)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                              title="Xóa podcast"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: QUẢN LÝ NGƯỜI DÙNG & PHÂN QUYỀN RBAC */}
        {/* ================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Quản trị Người dùng &amp; Phân quyền RBAC</h2>
                <p className="text-xs text-slate-500">
                  Cấp quyền Bác sĩ (ROLE_DOCTOR), Quản trị viên (ROLE_ADMIN) hoặc Người bệnh (ROLE_PATIENT)
                </p>
              </div>

              {/* Tìm kiếm */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Tìm theo tên, email, username..."
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-300 focus:border-teal-700 outline-none"
                />
              </div>
            </div>

            {/* Bảng danh sách người dùng */}
            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5 w-12 text-center">ID</th>
                    <th className="p-3.5">Họ và tên</th>
                    <th className="p-3.5">Tài khoản</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Vai trò hiện tại</th>
                    <th className="p-3.5 text-center">Trạng thái</th>
                    <th className="p-3.5 text-right">Phân quyền / Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const roleName = u.role?.name || 'ROLE_PATIENT';
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 text-center font-mono text-slate-400 font-bold">{u.id}</td>
                        <td className="p-3.5 font-bold text-slate-900">{u.fullName || '---'}</td>
                        <td className="p-3.5 font-mono text-slate-700 font-semibold">{u.username}</td>
                        <td className="p-3.5 text-slate-600">{u.email}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                            roleName === 'ROLE_ADMIN' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                            roleName === 'ROLE_DOCTOR' ? 'bg-teal-100 text-teal-900 border border-teal-300' :
                            'bg-slate-200 text-slate-800'
                          }`}>
                            {roleName === 'ROLE_ADMIN' ? 'QUẢN TRỊ VIÊN' :
                             roleName === 'ROLE_DOCTOR' ? 'BÁC SĨ CHUYÊN KHOA' :
                             'BỆNH NHÂN / ĐỘC GIẢ'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 1 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {u.status === 1 ? 'Hoạt động' : 'Đã khóa'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Chọn quyền */}
                            <select
                              value={roleName === 'ROLE_LISTENER' ? 'ROLE_PATIENT' : roleName}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="text-[11px] p-1.5 rounded-lg border border-slate-300 bg-white outline-none cursor-pointer font-medium"
                            >
                              <option value="ROLE_PATIENT">Bệnh nhân</option>
                              <option value="ROLE_DOCTOR">Bác sĩ</option>
                              <option value="ROLE_ADMIN">Quản trị viên</option>
                            </select>

                            {/* Nút Khóa / Mở khóa */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(u.id, u.status)}
                              className={`p-1.5 rounded-lg transition border ${
                                u.status === 1 
                                  ? 'text-slate-400 hover:text-rose-600 border-slate-200 hover:border-rose-200' 
                                  : 'text-rose-600 hover:text-emerald-600 border-rose-200 hover:border-emerald-200'
                              }`}
                              title={u.status === 1 ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            >
                              {u.status === 1 ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: BỘ NHỚ ĐỆM ÂM THANH & KHO LƯU TRỮ (AUDIO CACHE & STORAGE) */}
        {/* ================================================================= */}
        {activeTab === 'cache' && (
          <div className="space-y-6">
            {/* Banner Thông tin Kho lưu trữ & Dọn dẹp âm thanh */}
            <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-teal-400" />
                  <h3 className="text-base font-bold">Quản Trị Kho Âm Thanh Vật Lý (`tts-service/audio_storage`)</h3>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Tổng dung lượng: <strong className="text-teal-300">{stats.storageStats?.totalSizeMb || 57.1} MB</strong> ({stats.storageStats?.totalFiles || 41} tệp).
                  Hệ thống tự động đồng bộ và hỗ trợ loại bỏ các tệp MP3 mồ côi khi người dùng xóa phiên chat hoặc hủy lịch nhắc thuốc.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCleanupStorage}
                  disabled={actionLoading}
                  className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" /> {actionLoading ? 'Đang quét...' : 'Dọn Dẹp Âm Thanh Mồ Côi'}
                </button>

                <button
                  type="button"
                  onClick={handleClearAllCache}
                  className="px-4 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa Toàn Bộ Cache
                </button>
              </div>
            </div>

            {/* Header Bảng Audio Cache */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Bộ nhớ đệm âm thanh (Audio Cache Registry)</h2>
                <p className="text-xs text-slate-500">
                  Lưu trữ kết quả băm SHA-256 [Văn bản + Giọng + Tốc độ] để phản hồi ngay lập tức, tiết kiệm chi phí gọi Cloud TTS
                </p>
              </div>

              <button
                type="button"
                onClick={loadAllData}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Làm mới
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5 w-12 text-center">STT</th>
                    <th className="p-3.5">Mã băm SHA-256</th>
                    <th className="p-3.5">Giọng đọc</th>
                    <th className="p-3.5">Tốc độ</th>
                    <th className="p-3.5">Kích thước</th>
                    <th className="p-3.5">Thời lượng</th>
                    <th className="p-3.5">Động cơ</th>
                    <th className="p-3.5 text-center">Lượt trúng</th>
                    <th className="p-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cacheList.map((c, idx) => {
                    const isPlaying = playingAudio === (c.audioUrl?.startsWith('http') ? c.audioUrl : `http://localhost:8080${c.audioUrl}`);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 text-center text-slate-400 font-mono font-bold">{idx + 1}</td>
                        <td className="p-3.5 font-mono text-slate-800 text-[11px] truncate max-w-[200px]" title={c.textHash}>
                          {c.textHash}
                        </td>
                        <td className="p-3.5 font-bold text-teal-900">{c.voiceCode}</td>
                        <td className="p-3.5 font-mono">{c.speed}</td>
                        <td className="p-3.5 font-mono">{Math.round((c.fileSize || 0) / 1024)} KB</td>
                        <td className="p-3.5 font-mono">{c.durationSeconds ? `${Math.round(c.durationSeconds)}s` : '---'}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {c.engineUsed || 'medical_tts'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-bold text-teal-800 font-mono">
                          {c.hitCount || 0}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {c.audioUrl && (
                              <button
                                type="button"
                                onClick={() => handlePlayAudio(c.audioUrl)}
                                className={`p-1.5 rounded-lg border transition ${
                                  isPlaying 
                                    ? 'bg-teal-700 text-white border-teal-800' 
                                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-teal-50 hover:text-teal-800'
                                }`}
                                title={isPlaying ? 'Dừng phát' : 'Nghe thử âm thanh'}
                              >
                                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteCacheEntry(c.id)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                              title="Xóa bản ghi cache này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {cacheList.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        Chưa có bản ghi cache nào trong cơ sở dữ liệu.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: GIÁM SÁT LỊCH NHẮC THUỐC & PHIÊN TƯ VẤN SỨC KHỎE */}
        {/* ================================================================= */}
        {activeTab === 'monitoring' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lịch nhắc thuốc gần đây */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-teal-700" />
                  <span>Lịch Nhắc Thuốc Hệ Thống ({reminderList.length})</span>
                </h3>
                <span className="text-xs text-slate-400">Tự động phát chuông &amp; TTS</span>
              </div>

              <div className="space-y-3">
                {reminderList.map((r) => (
                  <div key={r.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{r.medicineName} ({r.dosage})</p>
                      <p className="text-[11px] text-slate-500">Giờ nhắc: <strong className="text-teal-800">{r.reminderTime}</strong> hàng ngày</p>
                      {r.note && <p className="text-[11px] text-slate-400 italic mt-0.5">"{r.note}"</p>}
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      r.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {r.isActive ? 'Đang bật' : 'Tạm tắt'}
                    </span>
                  </div>
                ))}
                {reminderList.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-6">Chưa có lịch nhắc thuốc nào được tạo.</p>
                )}
              </div>
            </div>

            {/* Phiên tư vấn sức khỏe gần đây */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-teal-700" />
                  <span>Phiên Tư Vấn Sức Khỏe AI ({consultationList.length})</span>
                </h3>
                <span className="text-xs text-slate-400">Gemini LLM Engine</span>
              </div>

              <div className="space-y-3">
                {consultationList.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{c.title || 'Phiên tư vấn không tiêu đề'}</p>
                      <p className="text-[11px] text-slate-500">Bệnh nhân: <strong className="text-slate-700">{c.patient?.fullName || 'Bệnh nhân'}</strong></p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{c.createdAt ? new Date(c.createdAt).toLocaleString('vi-VN') : '---'}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'ACTIVE' ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {c.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã đóng'}
                    </span>
                  </div>
                ))}
                {consultationList.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-6">Chưa có phiên tư vấn nào.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
