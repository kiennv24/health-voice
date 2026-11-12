import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  Download, 
  ArrowLeft, 
  CheckCircle2, 
  Eye, 
  Headphones, 
  Clock, 
  Calendar, 
  Sparkles, 
  Share2, 
  AlertTriangle, 
  RefreshCw,
  Sliders,
  Check,
  Stethoscope
} from 'lucide-react';
import { podcastApi } from '../../api/endpoints';
import { useAudioPlayer } from '../../context/AudioContext';

const CATEGORY_MAP = {
  TIM_MACH: 'Tim Mạch & Huyết Áp',
  THAN_KINH: 'Thần Kinh & Đột Quỵ',
  TIEU_HOA: 'Tiêu Hóa & Dạ Dày',
  HO_HAP: 'Hô Hấp & Bệnh Theo Mùa',
  DINH_DUONG: 'Dinh Dưỡng & Lối Sống Lành Mạnh',
  DUOC_PHAM: 'Thuốc & Dược Liệu Hướng Dẫn',
};

const VOICES = [
  { id: 'banmai', name: 'Giọng Nữ Miền Bắc', gender: 'Nữ', region: 'Miền Bắc', engine: 'Y Khoa' },
  { id: 'thuminh', name: 'Giọng Nữ Truyền Cảm', gender: 'Nữ', region: 'Miền Bắc', engine: 'Y Khoa' },
  { id: 'leminh', name: 'Giọng Nam Trầm Ấm', gender: 'Nam', region: 'Miền Bắc', engine: 'Y Khoa' },
  { id: 'giahuy', name: 'Giọng Nam Miền Trung', gender: 'Nam', region: 'Miền Trung', engine: 'Y Khoa' },
  { id: 'myan', name: 'Giọng Nữ Miền Nam', gender: 'Nữ', region: 'Miền Nam', engine: 'Y Khoa' },
];

const SPEEDS = [
  { value: 0.75, label: '0.75x', desc: 'Cho người cao tuổi' },
  { value: 1.0, label: '1.0x', desc: 'Tốc độ chuẩn' },
  { value: 1.25, label: '1.25x', desc: 'Nhanh nhẹ' },
  { value: 1.5, label: '1.5x', desc: 'Nhanh' },
];

/* ─── Animated Waveform Component ─── */
function AudioWaveform({ isPlaying }) {
  return (
    <div className="flex items-end gap-1 h-7" aria-hidden>
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all ${
            isPlaying ? 'bg-teal-300 animate-bounce' : 'bg-teal-500/40 h-2'
          }`}
          style={
            isPlaying
              ? {
                  height: `${10 + (i % 4) * 5}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.6s',
                }
              : undefined
          }
        />
      ))}
    </div>
  );
}

export default function PodcastDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [podcast, setPodcast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { stopAll } = useAudioPlayer();

  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.15);
  const [selectedVoice, setSelectedVoice] = useState('banmai');
  const [isChangingVoice, setIsChangingVoice] = useState(false);
  const [hasTrackedListen, setHasTrackedListen] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Dừng âm thanh nền nếu có khi vào bài viết mới
    stopAll();
    fetchPodcast();

    return () => {
      // Khi thoát ra khỏi bài viết, lập tức tắt hoàn toàn âm thanh
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
        audioRef.current = null;
      }
      stopAll();
    };
  }, [slug, stopAll]);

  const fetchPodcast = async () => {
    setLoading(true);
    try {
      const res = await podcastApi.getBySlug(slug);
      const data = res?.data || res;
      setPodcast(data);
      if (data?.defaultVoice) {
        setSelectedVoice(data.defaultVoice);
      }
    } catch (err) {
      console.error(err);
      setError('Không thể tải bài viết podcast này.');
    } finally {
      setLoading(false);
    }
  };

  // Setup Audio Object when podcast or audioUrl changes
  useEffect(() => {
    if (!podcast?.audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(podcast.audioUrl);
    audioRef.current = audio;
    audio.playbackRate = playbackRate;

    audio.onloadedmetadata = () => {
      setDuration(audio.duration || podcast.audioDurationSeconds || 0);
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.onerror = () => {
      setIsPlaying(false);
    };

    return () => {
      audio.pause();
    };
  }, [podcast?.audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.warn(e));
      setIsPlaying(true);

      // Ghi nhận lượt nghe vào DB lần đầu
      if (!hasTrackedListen && podcast?.id) {
        podcastApi.trackListen(podcast.id).catch(() => {});
        setHasTrackedListen(true);
      }
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleSkip = (seconds) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleChangeSpeed = (speed) => {
    setPlaybackRate(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleChangeVoice = async (voiceCode) => {
    if (voiceCode === selectedVoice || isChangingVoice) return;
    setSelectedVoice(voiceCode);
    setIsChangingVoice(true);

    try {
      const res = await podcastApi.changeVoice(podcast.id, voiceCode);
      const updated = res?.data || res;
      if (updated?.audioUrl) {
        setPodcast(prev => ({ ...prev, audioUrl: updated.audioUrl, defaultVoice: voiceCode }));
      }
    } catch (err) {
      console.error('Lỗi đổi giọng đọc:', err);
    } finally {
      setIsChangingVoice(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const renderContentFormatted = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Embedded Image: ![alt](url)
      const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        const alt = imgMatch[1] || 'Hình ảnh minh họa lâm sàng';
        const src = imgMatch[2];
        return (
          <figure key={idx} className="my-6 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs">
            <img src={src} alt={alt} className="w-full max-h-96 object-cover" />
            {alt && (
              <figcaption className="p-3 text-center text-xs text-slate-500 italic bg-white border-t border-slate-100">
                {alt}
              </figcaption>
            )}
          </figure>
        );
      }

      // Blockquote: > text
      if (trimmed.startsWith('> ')) {
        const q = trimmed.replace(/^>\s+/, '');
        return (
          <blockquote key={idx} className="my-4 p-4 border-l-4 border-teal-700 bg-teal-50/70 rounded-r-xl text-slate-800 text-sm italic shadow-2xs">
            <span dangerouslySetInnerHTML={{ __html: highlightMedicalTerms(q) }} />
          </blockquote>
        );
      }

      // H3 heading
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-xl font-bold text-slate-900 mt-8 mb-3 pb-1 border-b border-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-700" />
            {line.replace('### ', '')}
          </h3>
        );
      }
      // H2 heading
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-2xl font-extrabold text-slate-900 mt-10 mb-4 pb-2 border-b border-slate-200">
            {line.replace('## ', '')}
          </h2>
        );
      }
      // Divider
      if (line.trim() === '---') {
        return <hr key={idx} className="my-8 border-slate-200" />;
      }
      // List items
      if (line.trim().startsWith('*   ') || line.trim().startsWith('-   ') || line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const itemText = line.trim().replace(/^(\*|\-)\s+/, '');
        return (
          <li key={idx} className="ml-5 list-disc text-slate-700 text-sm sm:text-base leading-relaxed my-1.5 pl-1">
            <span dangerouslySetInnerHTML={{ __html: highlightMedicalTerms(itemText) }} />
          </li>
        );
      }
      // Numbered list
      if (/^\d+\.\s+/.test(line.trim())) {
        return (
          <li key={idx} className="ml-5 list-decimal text-slate-700 text-sm sm:text-base leading-relaxed my-1.5 pl-1 font-medium">
            <span dangerouslySetInnerHTML={{ __html: highlightMedicalTerms(line.trim().replace(/^\d+\.\s+/, '')) }} />
          </li>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-3" />;
      }
      // Normal paragraph
      return (
        <p
          key={idx}
          className="text-slate-700 text-sm sm:text-base leading-relaxed my-2.5"
          dangerouslySetInnerHTML={{ __html: highlightMedicalTerms(line) }}
        />
      );
    });
  };

  // Làm nổi bật các số đo, chỉ số huyết áp, tên thuốc, số điện thoại khẩn cấp
  const highlightMedicalTerms = (str) => {
    let out = str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-teal-900 font-medium">$1</em>')
      .replace(/(140\/90\s*mmHg|180\/120\s*mmHg|130\/80\s*mmHg)/g, '<span class="bg-rose-100 text-rose-900 font-bold px-1.5 py-0.5 rounded font-mono text-sm">$1</span>')
      .replace(/(4\.5\s*giờ|4\s*giờ\s*vàng|6\s*giờ)/g, '<span class="bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded font-mono text-sm">$1</span>')
      .replace(/(115|Cấp cứu 115)/g, '<span class="bg-red-700 text-white font-bold px-2 py-0.5 rounded font-mono text-sm tracking-wider">☎ $1</span>')
      .replace(/(F\s*-\s*Face|A\s*-\s*Arms|S\s*-\s*Speech|T\s*-\s*Time)/g, '<span class="bg-teal-100 text-teal-950 font-bold px-2 py-0.5 rounded font-mono">$1</span>');
    return out;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-teal-700" />
          Đang tải bài viết y khoa &amp; chuẩn bị âm thanh...
        </div>
      </div>
    );
  }

  if (error || !podcast) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800 mb-2">{error || 'Không tìm thấy bài viết'}</h2>
          <button
            onClick={() => navigate('/patient/podcasts')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-teal-800 text-white rounded-lg text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại thư viện podcast
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* =================================================================== */}
      {/* 1. HERO STICKY AUDIO PLAYER (Ghim ở đầu bài viết)                   */}
      {/* =================================================================== */}
      <section className="sticky top-16 z-30 bg-teal-900 text-white shadow-lg border-b border-teal-800 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Title & Animated Waveform */}
            <div className="flex items-center gap-3.5 w-full md:w-auto">
              <AudioWaveform isPlaying={isPlaying} />
              <div className="truncate flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                  <Volume2 className="w-3 h-3" />
                  Đang phát Podcast Y Khoa:
                </span>
                <div className="text-xs sm:text-sm font-bold truncate text-white">
                  {podcast.title}
                </div>
              </div>
            </div>

            {/* Middle: Audio Controls */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Rewind 10s */}
              <button
                type="button"
                onClick={() => handleSkip(-10)}
                title="Lùi lại 10 giây"
                className="p-2 text-teal-200 hover:text-white hover:bg-teal-800 rounded-full transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Big Play/Pause Button */}
              <button
                type="button"
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-white text-teal-900 hover:bg-teal-100 flex items-center justify-center font-bold shadow-md transition transform active:scale-95"
                title={isPlaying ? 'Tạm dừng' : 'Bắt đầu nghe'}
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
              </button>

              {/* Forward 10s */}
              <button
                type="button"
                onClick={() => handleSkip(10)}
                title="Tua tới 10 giây"
                className="p-2 text-teal-200 hover:text-white hover:bg-teal-800 rounded-full transition"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Smart Speed & Voice Selector & Download */}
            <div className="flex items-center gap-2 flex-wrap justify-end w-full md:w-auto text-xs">
              {/* Tốc độ đọc thông minh */}
              <div className="flex items-center bg-teal-950/60 rounded-lg p-0.5 border border-teal-800">
                {SPEEDS.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => handleChangeSpeed(s.value)}
                    title={s.desc}
                    className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                      playbackRate === s.value
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-teal-300 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Giọng đọc y khoa chuẩn */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-950/80 border border-teal-800 text-[11px] font-semibold text-teal-200">
                <Volume2 className="w-3.5 h-3.5 text-teal-300" />
                <span>Giọng Đọc Y Khoa Chuẩn</span>
              </div>

              {/* Tải MP3 offline */}
              {podcast.audioUrl && (
                <a
                  href={podcast.audioUrl}
                  download={`${podcast.slug}.mp3`}
                  title="Tải audio MP3 nghe offline"
                  className="p-1.5 rounded-lg bg-teal-800 hover:bg-teal-700 text-teal-100 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Progress Timeline Scrubber */}
          <div className="flex items-center gap-3 mt-3 pt-2 border-t border-teal-800/80 text-[11px] font-mono text-teal-300">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.5"
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-teal-950 rounded-lg appearance-none cursor-pointer accent-teal-300"
            />
            <span className="w-10">{formatTime(duration)}</span>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 2. ARTICLE BODY (Thân bài viết chuẩn lâm sàng)                     */}
      {/* =================================================================== */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link to="/" className="hover:text-teal-800 transition">Trang chủ</Link>
          <span>/</span>
          <Link to="/patient/podcasts" className="hover:text-teal-800 transition">Thư viện Podcast</Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold truncate max-w-xs">{podcast.title}</span>
        </div>

        {/* Title & Metadata */}
        <div className="space-y-4 pb-6 border-b border-slate-200">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider">
            Chuyên khoa: {CATEGORY_MAP[podcast.category] || podcast.categoryDisplayName || podcast.category}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {podcast.title}
          </h1>

          {/* Doctor Author Card */}
          <div className="flex items-center justify-between gap-4 pt-2 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {podcast.authorName ? podcast.authorName.charAt(0) : 'B'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-sm">
                    {podcast.authorName || 'Bác sĩ Chuyên khoa'}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-teal-600" />
                    Verified Doctor
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Biên soạn &amp; Kiểm duyệt nội dung chuyên môn
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Headphones className="w-3.5 h-3.5 text-teal-700" />
                {podcast.listenCount || 0} lượt nghe
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {podcast.viewsCount || 0} lượt xem
              </span>
            </div>
          </div>
        </div>

        {/* Big Article Thumbnail */}
        <div className="my-6 rounded-2xl overflow-hidden border border-slate-200 shadow-xs aspect-video bg-slate-100">
          <img
            src={podcast.thumbnailUrl}
            alt={podcast.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Lead Summary Callout */}
        <div className="p-5 rounded-xl bg-teal-50/70 border-l-4 border-teal-700 text-slate-800 my-6 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-900 block mb-1">
            Tóm tắt lâm sàng từ Bác sĩ:
          </span>
          <p className="text-sm sm:text-base leading-relaxed font-medium text-slate-800">
            {podcast.summary}
          </p>
        </div>

        {/* Detailed Clinical Content */}
        <article className="prose prose-slate max-w-none font-sans">
          {renderContentFormatted(podcast.content)}
        </article>

        {/* Bottom Medical Disclaimer */}
        <div className="mt-12 p-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Lưu ý y tế quan trọng:</strong> Nội dung bài viết và giọng đọc AI nhằm mục đích phổ biến kiến thức chăm sóc sức khỏe cộng đồng và hướng dẫn xử trí ban đầu. Trong mọi trường hợp khẩn cấp có đe dọa tính mạng (đột quỵ, khó thở cấp, tăng huyết áp kịch phát), người nhà cần liên hệ ngay Tổng đài Cấp cứu 115 hoặc đưa bệnh nhân đến cơ sở y tế gần nhất.
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={() => navigate('/patient/podcasts')}
            className="inline-flex items-center gap-2 text-xs font-bold text-teal-800 hover:text-teal-900 bg-white border border-slate-200 px-4 py-2.5 rounded-lg shadow-xs hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Xem các podcast sức khỏe khác
          </button>
        </div>
      </main>
    </div>
  );
}

