import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Headphones, 
  Search, 
  Clock, 
  Eye, 
  CheckCircle2, 
  HeartPulse, 
  Brain, 
  Flame, 
  Apple, 
  Bone, 
  Sparkles,
  ChevronRight,
  RefreshCw,
  BookOpen,
  Play,
  Pause,
  AlertTriangle,
  Stethoscope,
  Pill,
  MessageSquare,
  Volume2,
  ShieldCheck,
  PhoneCall,
  Activity,
  Calculator,
  Users,
  Star,
  Building2,
  FileCheck,
  ArrowRight,
  Info,
  Wind
} from 'lucide-react';
import { podcastApi } from '../../api/endpoints';
import { useAudioPlayer } from '../../context/AudioContext';

const CATEGORIES = [
  { id: 'ALL', name: 'Tất cả chuyên khoa', icon: BookOpen },
  { id: 'TIM_MACH', name: 'Tim Mạch & Huyết Áp', icon: HeartPulse },
  { id: 'THAN_KINH', name: 'Thần Kinh & Đột Quỵ', icon: Brain },
  { id: 'TIEU_HOA', name: 'Tiêu Hóa & Dạ Dày', icon: Stethoscope },
  { id: 'HO_HAP', name: 'Hô Hấp & Bệnh Theo Mùa', icon: Wind },
  { id: 'DINH_DUONG', name: 'Dinh Dưỡng & Lối Sống', icon: Apple },
  { id: 'DUOC_PHAM', name: 'Thuốc & Dược Liệu', icon: Pill },
];

const CATEGORY_STYLES = {
  TIM_MACH: { bg: 'bg-rose-50 text-rose-900 border-rose-200', dot: 'bg-rose-600', label: 'Tim Mạch & Huyết Áp' },
  THAN_KINH: { bg: 'bg-purple-50 text-purple-900 border-purple-200', dot: 'bg-purple-600', label: 'Thần Kinh & Đột Quỵ' },
  TIEU_HOA: { bg: 'bg-orange-50 text-orange-900 border-orange-200', dot: 'bg-orange-600', label: 'Tiêu Hóa & Dạ Dày' },
  HO_HAP: { bg: 'bg-sky-50 text-sky-900 border-sky-200', dot: 'bg-sky-600', label: 'Hô Hấp & Bệnh Theo Mùa' },
  DINH_DUONG: { bg: 'bg-emerald-50 text-emerald-900 border-emerald-200', dot: 'bg-emerald-600', label: 'Dinh Dưỡng & Lối Sống Lành Mạnh' },
  DUOC_PHAM: { bg: 'bg-teal-50 text-teal-900 border-teal-200', dot: 'bg-teal-600', label: 'Thuốc & Dược Liệu Hướng Dẫn' },
};

// 6 Chủ đề sức khỏe y khoa trọng điểm
const FEATURED_TOPICS = [
  {
    id: 'TIM_MACH',
    title: 'Tim Mạch & Huyết Áp',
    subtitle: 'Kiểm soát chỉ số HA tại nhà, hạ áp an toàn, giảm nguy cơ tai biến',
    img: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop',
    tag: 'Tim Mạch Học',
    tagColor: 'bg-rose-700 text-white',
    count: '6 bài viết & audio'
  },
  {
    id: 'THAN_KINH',
    title: 'Thần Kinh & Đột Quỵ',
    subtitle: 'Nhận diện quy tắc FAST trong 4 giờ vàng, cấp cứu tai biến mạch máu não',
    img: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&auto=format&fit=crop',
    tag: 'Cấp Cứu 115',
    tagColor: 'bg-purple-700 text-white',
    count: '5 bài viết & audio'
  },
  {
    id: 'TIEU_HOA',
    title: 'Tiêu Hóa & Dạ Dày',
    subtitle: 'Phác đồ điều trị viêm loét dạ dày tá tràng, vi khuẩn HP và trào ngược GERD',
    img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop',
    tag: 'Tiêu Hóa Gan Mật',
    tagColor: 'bg-orange-600 text-white',
    count: '5 bài viết & audio'
  },
  {
    id: 'HO_HAP',
    title: 'Hô Hấp & Bệnh Theo Mùa',
    subtitle: 'Cắt cơn hen phế quản cấp, theo dõi SpO2 và viêm phế quản tắc nghẽn mùa lạnh',
    img: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop',
    tag: 'Hô Hấp Học',
    tagColor: 'bg-sky-700 text-white',
    count: '5 bài viết & audio'
  },
  {
    id: 'DINH_DUONG',
    title: 'Dinh Dưỡng & Lối Sống',
    subtitle: 'Chế độ ăn Địa Trung Hải, dinh dưỡng đái tháo đường và phục hồi thoái hóa khớp',
    img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop',
    tag: 'Dinh Dưỡng Lâm Sàng',
    tagColor: 'bg-emerald-700 text-white',
    count: '5 bài viết & audio'
  },
  {
    id: 'DUOC_PHAM',
    title: 'Thuốc & Dược Liệu',
    subtitle: 'Hướng dẫn sử dụng kháng sinh an toàn, liều Paracetamol và tương tác thuốc Statin',
    img: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop',
    tag: 'Dược Học Lâm Sàng',
    tagColor: 'bg-teal-800 text-white',
    count: '5 bài viết & audio'
  }
];

export default function PodcastFeedPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { stopAll } = useAudioPlayer();

  // Spotlight player state
  const [spotlightPlaying, setSpotlightPlaying] = useState(false);
  const spotlightAudioRef = useRef(null);

  // Interactive Tool States: BMI Calculator
  const [heightCm, setHeightCm] = useState(165);
  const [weightKg, setWeightKg] = useState(62);
  const [activeToolTab, setActiveToolTab] = useState('bmi'); // 'bmi' | 'bp'

  // Interactive Tool States: Blood Pressure Lookup
  const [sysBp, setSysBp] = useState(135);
  const [diaBp, setDiaBp] = useState(85);

  const fetchPodcasts = async () => {
    setLoading(true);
    try {
      const params = {
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
        keyword: searchKeyword.trim() || undefined,
        size: 20,
      };
      const res = await podcastApi.getPublic(params);
      const data = res?.data?.content || res?.data || res || [];
      if (Array.isArray(data)) {
        setPodcasts(data);
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách podcast:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPodcasts();
    return () => {
      if (spotlightAudioRef.current) {
        spotlightAudioRef.current.pause();
        spotlightAudioRef.current.currentTime = 0;
        spotlightAudioRef.current.src = '';
        spotlightAudioRef.current = null;
      }
      stopAll();
    };
  }, [selectedCategory, stopAll]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPodcasts();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '⏱ 4 phút nghe';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `⏱ ${m} phút ${s > 0 ? s + 's' : ''} nghe`;
  };

  const spotlightPodcast = podcasts.find(p => p.slug?.includes('fast') || p.category === 'THAN_KINH') || podcasts[0];

  const toggleSpotlightPlay = () => {
    if (!spotlightPodcast?.audioUrl) return;

    if (!spotlightAudioRef.current) {
      spotlightAudioRef.current = new Audio(spotlightPodcast.audioUrl);
      spotlightAudioRef.current.onended = () => setSpotlightPlaying(false);
      spotlightAudioRef.current.onerror = () => setSpotlightPlaying(false);
    }

    if (spotlightPlaying) {
      spotlightAudioRef.current.pause();
      setSpotlightPlaying(false);
    } else {
      spotlightAudioRef.current.play().catch(e => console.warn(e));
      setSpotlightPlaying(true);
    }
  };

  // BMI Logic
  const calcBmi = () => {
    const hM = heightCm / 100;
    if (hM <= 0) return 0;
    return (weightKg / (hM * hM)).toFixed(1);
  };
  const bmiValue = parseFloat(calcBmi());
  const getBmiStatus = (bmi) => {
    if (bmi < 18.5) return { label: 'Thiếu cân / Gầy', color: 'text-amber-700 bg-amber-50 border-amber-200', advice: 'Cần bổ sung đạm, vi chất dinh dưỡng và kiểm tra hấp thu tiêu hóa.' };
    if (bmi <= 22.9) return { label: 'Thể trạng Chuẩn (WHO Châu Á)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', advice: 'Chỉ số lý tưởng! Tiếp tục duy trì chế độ dinh dưỡng lành mạnh và vận động 30 phút mỗi ngày.' };
    if (bmi <= 24.9) return { label: 'Tiền Béo phì / Thừa cân', color: 'text-orange-700 bg-orange-50 border-orange-200', advice: 'Nên giảm lượng tinh bột nhanh, giảm muối và tăng cường bài tập tim mạch.' };
    return { label: 'Béo phì (Nguy cơ Tim mạch)', color: 'text-rose-700 bg-rose-50 border-rose-200', advice: 'Nguy cơ cao mắc Tăng huyết áp và Đái tháo đường. Hãy tham vấn Bác sĩ chuyên khoa sớm.' };
  };
  const bmiStatus = getBmiStatus(bmiValue);

  // Blood Pressure Logic
  const getBpStatus = (sys, dia) => {
    if (sys >= 180 || dia >= 120) {
      return { 
        level: 'CƠN TĂNG HUYẾT ÁP KHẨN CẤP', 
        badge: 'bg-rose-700 text-white', 
        desc: 'Nguy cơ đột quỵ hoặc suy tim cấp! Hãy gọi ngay tổng đài 115 hoặc đến cơ sở y tế gần nhất trong 15 phút.',
        urgent: true
      };
    }
    if (sys >= 140 || dia >= 90) {
      return { 
        level: 'Tăng Huyết Áp Độ 2', 
        badge: 'bg-rose-100 text-rose-800 border-rose-300', 
        desc: 'Cần khám chuyên khoa tim mạch để điều chỉnh phác đồ thuốc hạ áp phối hợp.',
        urgent: false
      };
    }
    if (sys >= 130 || dia >= 80) {
      return { 
        level: 'Tăng Huyết Áp Độ 1', 
        badge: 'bg-amber-100 text-amber-900 border-amber-300', 
        desc: 'Cần giảm muối (<5g/ngày), hạn chế rượu bia và đo lại sau khi nghỉ ngơi 15 phút.',
        urgent: false
      };
    }
    if (sys >= 120 && dia < 80) {
      return { 
        level: 'Huyết Áp Tối Ưu / Giới Hạn', 
        badge: 'bg-blue-100 text-blue-900 border-blue-300', 
        desc: 'Chỉ số có xu hướng tăng nhẹ, nên theo dõi nhật ký đo huyết áp hàng tuần.',
        urgent: false
      };
    }
    return { 
      level: 'Huyết Áp Bình Thường', 
      badge: 'bg-emerald-100 text-emerald-900 border-emerald-300', 
      desc: 'Hệ tim mạch của bạn đang vận hành ổn định. Duy trì lối sống tích cực!',
      urgent: false
    };
  };
  const bpStatus = getBpStatus(sysBp, diaBp);

  return (
    <div className="min-h-screen bg-slate-50/70 pb-24 text-slate-900 font-sans">
      {/* =================================================================== */}
      {/* 1. TOP EMERGENCY & ACCREDITATION BANNER                             */}
      {/* =================================================================== */}
      <div className="bg-slate-950 text-slate-100 text-xs py-2.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white tracking-tight">HealthVoice • Cổng Thông Tin &amp; Trợ Lý Y Khoa AI</span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-slate-300 font-medium">Biên soạn bởi Hội Đồng Bác Sĩ Chuyên Khoa</span>
            <span className="hidden lg:inline text-slate-600">•</span>
            <span className="hidden lg:inline text-teal-300 font-medium">Giọng Đọc Y Khoa 100% Không Cắt Xén</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] shrink-0">
            <span className="text-slate-400">Cấp cứu y tế 24/7:</span>
            <a 
              href="tel:115" 
              className="font-bold text-rose-300 hover:text-white flex items-center gap-1.5 font-mono bg-rose-950/80 px-2.5 py-0.5 rounded-md border border-rose-800 transition t-btn-press"
            >
              <PhoneCall className="w-3 h-3 text-rose-400" /> Gọi 115
            </a>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. ELITE HERO SECTION WITH HEALTH SEARCH & ACTION PILLS            */}
      {/* =================================================================== */}
      <section className="bg-white border-b border-slate-200/90 pt-10 pb-14 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Col: Main Headline & Modern Search */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold">
                <Volume2 className="w-3.5 h-3.5 text-teal-700" />
                <span>Giọng đọc y tế chuẩn lâm sàng • Chuẩn hóa 100% thuật ngữ</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-slate-900 tracking-tight leading-[1.16]">
                Nền Tảng Đa Phương Tiện &amp; <br />
                <span className="text-teal-800">Cẩm Nang Sức Khỏe Bác Sĩ</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                Thông tin y khoa chính thống từ Bác sĩ chuyên khoa hàng đầu. Lắng nghe hướng dẫn phòng bệnh và sơ cứu khẩn cấp qua giọng đọc AI truyền cảm, phát âm chuẩn 100% thuật ngữ và đơn vị thuốc tiếng Việt.
              </p>

              {/* Search Bar */}
              <div className="pt-1 max-w-xl space-y-3">
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchKeyword}
                      onChange={e => setSearchKeyword(e.target.value)}
                      placeholder="Tìm kiếm: đột quỵ FAST, huyết áp 140/90, sốt trẻ em, hạ áp..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/90 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 focus:bg-white transition"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-sm font-semibold shadow-xs transition shrink-0 t-btn-press"
                  >
                    Tìm kiếm
                  </button>
                </form>

                {/* Quick Search Chips */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
                  <span className="text-[11px] font-semibold text-slate-400">Từ khóa tra cứu nhanh:</span>
                  {[
                    { label: 'Đột quỵ FAST', kw: 'đột quỵ' },
                    { label: 'Huyết áp 140/90', kw: 'huyết áp' },
                    { label: 'Hạ sốt Paracetamol', kw: 'sốt' },
                    { label: 'Chỉ số SpO2', kw: 'spo2' },
                    { label: 'Đái tháo đường', kw: 'đường huyết' },
                  ].map(chip => (
                    <button
                      key={chip.kw}
                      type="button"
                      onClick={() => {
                        setSearchKeyword(chip.kw);
                        setTimeout(() => fetchPodcasts(), 50);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-600 border border-slate-200/80 transition t-btn-press"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: 4 Elite Health Service Cards */}
            <div className="lg:col-span-5">
              <div className="grid grid-cols-2 gap-4">
                {/* 1. Tư Vấn AI */}
                <Link
                  to="/patient"
                  className="p-5 rounded-2xl bg-gradient-to-br from-teal-50/90 to-emerald-50/60 border border-teal-500/80 hover:border-teal-600 hover:shadow-md transition-all duration-200 group relative overflow-hidden flex flex-col justify-between t-btn-press"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold mb-3 shadow-xs group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-5 h-5 text-teal-100" />
                  </div>
                  <div>
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-600 text-white mb-1.5 shadow-2xs">
                      Triage 115
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-teal-900 transition-colors">
                      Tư Vấn Sức Khỏe AI
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      Phân loại cấp cứu đột quỵ, tim mạch, sốt cao tức thì
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-teal-800 group-hover:translate-x-1 transition-transform">
                    <span>Hỏi Bác sĩ ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>

                {/* 2. Thư viện Podcast */}
                <a
                  href="#podcast-library"
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-teal-500 hover:shadow-md transition-all duration-200 group flex flex-col justify-between t-btn-press"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 border border-teal-200/80 flex items-center justify-center font-bold mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 mb-1.5">
                      Âm Thanh Y Khoa
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-teal-900 transition-colors">
                      Podcast Y Khoa
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      100% nội dung bài viết đầy đủ không tóm tắt cắt xén
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-teal-800 group-hover:translate-x-1 transition-transform">
                    <span>Khám phá kho audio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </a>

                {/* 3. Lịch nhắc thuốc */}
                <Link
                  to="/reminders"
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-teal-500 hover:shadow-md transition-all duration-200 group flex flex-col justify-between t-btn-press"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center justify-center font-bold mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 mb-1.5">
                      Báo Thức Giọng Nói
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-teal-900 transition-colors">
                      Lịch Nhắc Thuốc
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      Tự động canh giờ uống và phát âm tên thuốc rõ ràng
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-blue-800 group-hover:translate-x-1 transition-transform">
                    <span>Cài đặt lịch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>

                {/* 4. Tiện ích Chỉ số */}
                <a
                  href="#health-tools"
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-teal-500 hover:shadow-md transition-all duration-200 group flex flex-col justify-between t-btn-press"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center font-bold mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 mb-1.5">
                      Công Cụ Lâm Sàng
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-teal-900 transition-colors">
                      Tính BMI &amp; Huyết Áp
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      Đo chỉ số sinh tồn và đối chiếu chuẩn hiệp hội tim mạch
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-amber-800 group-hover:translate-x-1 transition-transform">
                    <span>Tính toán ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 3. CHỦ ĐỀ SỨC KHỎE QUAN TÂM NHẤT (Clinical Focus Topics)            */}
      {/* =================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-700" />
              Chuyên Mục Y Khoa Được Quan Tâm Nhất
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Các cẩm nang cấp cứu và phòng bệnh mạn tính được biên soạn bởi Bác sĩ chuyên khoa
            </p>
          </div>
          <span className="text-xs text-teal-800 font-semibold hidden sm:inline bg-teal-50 px-3 py-1 rounded-full border border-teal-200/80">
            {FEATURED_TOPICS.length} Chuyên đề trọng điểm • Đạt chuẩn lâm sàng
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_TOPICS.map(topic => (
            <div
              key={topic.id}
              onClick={() => navigate(`/category/${topic.id}`)}
              className="group cursor-pointer bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-teal-500/80 transition-all duration-200 flex flex-col t-btn-press"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={topic.img}
                  alt={topic.title}
                  className="w-full h-full object-cover group-hover:scale-[1.025] transition-transform duration-500 ease-out"
                />
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs ${topic.tagColor}`}>
                    {topic.tag}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-950/80 text-white backdrop-blur-xs font-mono">
                    {topic.count}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-teal-800 transition-colors line-clamp-1">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                    {topic.subtitle}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-800">
                  <span>Xem chuyên đề</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =================================================================== */}
      {/* 4. SPOTLIGHT PODCAST HERO (Nghe Bản Tin Âm Thanh Y Khoa)           */}
      {/* =================================================================== */}
      {spotlightPodcast && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-teal-950 to-slate-900 text-white shadow-xl border border-teal-800/80">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-6 sm:p-10">
              {/* Image Col */}
              <div className="md:col-span-5 relative aspect-video rounded-2xl overflow-hidden shadow-inner border border-teal-700/50 group">
                <img
                  src={spotlightPodcast.thumbnailUrl}
                  alt={spotlightPodcast.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-[1.025] transition-transform duration-500 ease-out"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-md bg-rose-600 text-white uppercase tracking-wider shadow-sm">
                    ★ Bản Tin Y Khoa Tâm Điểm
                  </span>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-md bg-slate-950/90 text-teal-200 border border-teal-700/60 backdrop-blur-xs">
                    <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                    Giọng Đọc Y Khoa • 100% Full Audio
                  </span>
                </div>
              </div>

              {/* Content Col */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-0.5 rounded-md bg-teal-800/90 text-teal-100 border border-teal-700">
                    {CATEGORY_STYLES[spotlightPodcast.category]?.label || spotlightPodcast.category}
                  </span>
                  <span className="text-xs text-teal-300 font-mono">
                    {formatDuration(spotlightPodcast.audioDurationSeconds)}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-snug">
                  <Link to={`/patient/podcasts/${spotlightPodcast.slug}`} className="hover:text-teal-200 transition-colors">
                    {spotlightPodcast.title}
                  </Link>
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
                  {spotlightPodcast.summary}
                </p>

                {/* Doctor info & Quick Play */}
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-teal-800/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {spotlightPodcast.authorName ? spotlightPodcast.authorName.charAt(0) : 'B'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        {spotlightPodcast.authorName || 'BS. CKII Nguyễn Văn Hùng'}
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                      </div>
                      <span className="text-[11px] text-teal-300">Hội đồng duyệt chuyên môn lâm sàng</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {spotlightPodcast.audioUrl && (
                      <button
                        type="button"
                        onClick={toggleSpotlightPlay}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-teal-50 text-teal-950 font-bold rounded-xl text-xs transition shadow-sm t-btn-press"
                      >
                        {spotlightPlaying ? (
                          <>
                            <Pause className="w-4 h-4 fill-current text-teal-900" />
                            Tạm dừng
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-current text-teal-900 ml-0.5" />
                            Lắng nghe Podcast
                          </>
                        )}
                      </button>
                    )}

                    <Link
                      to={`/patient/podcasts/${spotlightPodcast.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-800 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition border border-teal-700 t-btn-press"
                    >
                      Đọc chi tiết
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* 5. INTERACTIVE CLINICAL HEALTH TOOLS (Tiện ích Sức Khỏe Trực Tuyến) */}
      {/* =================================================================== */}
      <section id="health-tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-teal-50 text-teal-800 rounded-xl border border-teal-200/80">
                  <Calculator className="w-4 h-4" />
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Tiện Ích Tính Toán Chỉ Số Sinh Tồn Trực Tuyến
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Tự đối chiếu chỉ số cơ thể với tiêu chuẩn Viện Dinh Dưỡng và Hiệp hội Tim Mạch Việt Nam
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setActiveToolTab('bmi')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 t-btn-press ${
                  activeToolTab === 'bmi'
                    ? 'bg-white text-teal-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tính chỉ số BMI
              </button>
              <button
                type="button"
                onClick={() => setActiveToolTab('bp')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 t-btn-press ${
                  activeToolTab === 'bp'
                    ? 'bg-white text-teal-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tra cứu Huyết áp (AHA)
              </button>
            </div>
          </div>

          {/* TAB 1: BMI CALCULATOR */}
          {activeToolTab === 'bmi' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-6 space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
                    <span>Chiều cao: <strong className="text-teal-800 text-sm font-bold font-mono">{heightCm} cm</strong></span>
                    <span className="text-slate-400 font-mono">120 - 210 cm</span>
                  </div>
                  <input
                    type="range"
                    min="120"
                    max="210"
                    value={heightCm}
                    onChange={e => setHeightCm(Number(e.target.value))}
                    className="w-full accent-teal-800 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
                    <span>Cân nặng: <strong className="text-teal-800 text-sm font-bold font-mono">{weightKg} kg</strong></span>
                    <span className="text-slate-400 font-mono">35 - 150 kg</span>
                  </div>
                  <input
                    type="range"
                    min="35"
                    max="150"
                    value={weightKg}
                    onChange={e => setWeightKg(Number(e.target.value))}
                    className="w-full accent-teal-800 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-semibold pt-1">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                    &lt; 18.5<br />Gầy
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                    18.5 - 22.9<br />Chuẩn
                  </div>
                  <div className="p-2.5 rounded-xl bg-orange-50 text-orange-800 border border-orange-200">
                    23 - 24.9<br />Thừa cân
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200">
                    &ge; 25<br />Béo phì
                  </div>
                </div>
              </div>

              {/* BMI Result card */}
              <div className="md:col-span-6 bg-slate-50/80 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Kết quả phân loại BMI</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${bmiStatus.color}`}>
                    {bmiStatus.label}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">{bmiValue}</span>
                  <span className="text-xs text-slate-500 font-medium">kg/m² (Tiêu chuẩn Châu Á - WPRO)</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
                  <strong className="text-slate-800 font-semibold block mb-0.5">Lời dặn dinh dưỡng lâm sàng:</strong>
                  {bmiStatus.advice}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: BLOOD PRESSURE MATRIX */}
          {activeToolTab === 'bp' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-6 space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
                    <span>Huyết áp Tâm thu (Số trên): <strong className="text-rose-700 text-sm font-bold font-mono">{sysBp} mmHg</strong></span>
                    <span className="text-slate-400 font-mono">80 - 220 mmHg</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="220"
                    value={sysBp}
                    onChange={e => setSysBp(Number(e.target.value))}
                    className="w-full accent-rose-700 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
                    <span>Huyết áp Tâm trương (Số dưới): <strong className="text-rose-700 text-sm font-bold font-mono">{diaBp} mmHg</strong></span>
                    <span className="text-slate-400 font-mono">50 - 130 mmHg</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="130"
                    value={diaBp}
                    onChange={e => setDiaBp(Number(e.target.value))}
                    className="w-full accent-rose-700 cursor-pointer"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Info className="w-3.5 h-3.5 text-teal-700" />
                    <span>Quy chuẩn đo huyết áp chuẩn y tế:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Nghỉ ngơi tĩnh tại 15 phút, không hút thuốc, không uống cà phê trước khi đo. Quấn bao đo ngang tầm tim.
                  </p>
                </div>
              </div>

              {/* BP Result card */}
              <div className="md:col-span-6 bg-slate-50/80 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Phân tầng nguy cơ tim mạch</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${bpStatus.badge}`}>
                    {bpStatus.level}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">{sysBp} / {diaBp}</span>
                  <span className="text-xs text-slate-500 font-medium">mmHg (Hiệp hội Tim Mạch Hoa Kỳ - AHA)</span>
                </div>

                <p className={`text-xs leading-relaxed p-3.5 rounded-xl border ${bpStatus.urgent ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold' : 'bg-white border-slate-200 text-slate-600'}`}>
                  {bpStatus.desc}
                </p>

                {bpStatus.urgent && (
                  <a
                    href="tel:115"
                    className="w-full py-3 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs t-btn-press"
                  >
                    <PhoneCall className="w-4 h-4 animate-bounce" />
                    Gọi Cấp Cứu 115 Ngay Lập Tức
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =================================================================== */}
      {/* 6. THƯ VIỆN PODCAST & BỘ LỌC CHUYÊN KHOA                            */}
      {/* =================================================================== */}
      <section id="podcast-library" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 flex-wrap">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Headphones className="w-5 h-5 text-teal-700" />
              Thư Viện Podcast &amp; Bản Tin Lâm Sàng ({podcasts.length})
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Chọn chuyên khoa y tế để lọc nội dung và lắng nghe toàn văn bản tin âm thanh y khoa
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map(c => {
              const Icon = c.icon;
              const isSelected = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    if (c.id === 'ALL') {
                      setSelectedCategory('ALL');
                    } else {
                      navigate(`/category/${c.id}`);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 border t-btn-press ${
                    isSelected
                      ? 'bg-teal-800 text-white border-teal-800 shadow-xs font-bold'
                      : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-200' : 'text-slate-500'}`} />
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ARTICLES GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-16 text-center text-slate-500">
            <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-3 text-teal-700" />
            Đang tải dữ liệu bài viết y khoa...
          </div>
        ) : podcasts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center">
            <Headphones className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base mb-1">Không tìm thấy bài viết phù hợp</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Không có bài viết nào trong chuyên khoa này hoặc từ khóa tìm kiếm chưa khớp.
            </p>
            <button
              onClick={() => { setSelectedCategory('ALL'); setSearchKeyword(''); }}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-4 py-2 rounded-lg transition t-btn-press"
            >
              Xem tất cả bài viết
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {podcasts.map(podcast => {
              const style = CATEGORY_STYLES[podcast.category] || {
                bg: 'bg-teal-50 text-teal-900 border-teal-200',
                dot: 'bg-teal-600',
                label: podcast.categoryDisplayName || podcast.category,
              };

              return (
                <article
                  key={podcast.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-500/80 transition-all duration-200 flex flex-col overflow-hidden group"
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    <img
                      src={podcast.thumbnailUrl}
                      alt={podcast.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-[1.025] transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    
                    {/* Category pill */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border backdrop-blur-xs ${style.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        {podcast.categoryDisplayName || style.label}
                      </span>
                    </div>

                    {/* Voice audio badge */}
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-950/90 text-teal-100 text-[10px] font-bold backdrop-blur-xs border border-teal-700/50">
                        <Volume2 className="w-3 h-3 text-teal-300" />
                        Audio Y Khoa
                      </span>
                    </div>

                    {/* Audio duration pill */}
                    <div className="absolute bottom-3 right-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-950/80 text-white text-[10px] font-mono font-medium backdrop-blur-xs">
                        {formatDuration(podcast.audioDurationSeconds)}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      {/* Doctor Verified Author */}
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-teal-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {podcast.authorName ? podcast.authorName.charAt(0) : 'B'}
                        </div>
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {podcast.authorName || 'BS. Chuyên khoa Y Tế'}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 font-semibold shrink-0" title="Bác sĩ đã xác minh">
                          <CheckCircle2 className="w-3 h-3 text-teal-600" />
                          Verified
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-teal-800 transition-colors">
                        <Link to={`/patient/podcasts/${podcast.slug}`}>
                          {podcast.title}
                        </Link>
                      </h2>

                      {/* Summary */}
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {podcast.summary}
                      </p>
                    </div>

                    {/* Footer Stats & Action */}
                    <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-mono">
                          <Headphones className="w-3.5 h-3.5 text-teal-600" />
                          {podcast.listenCount || 0}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          {podcast.viewsCount || 0}
                        </span>
                      </div>

                      <Link
                        to={`/patient/podcasts/${podcast.slug}`}
                        className="inline-flex items-center gap-1 font-bold text-teal-800 hover:text-teal-900 group/link transition"
                      >
                        Đọc &amp; Nghe Bản Tin
                        <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
