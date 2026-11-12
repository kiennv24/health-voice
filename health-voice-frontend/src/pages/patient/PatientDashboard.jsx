import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Mic, 
  Send, 
  Star, 
  Download, 
  X, 
  Check, 
  ChevronDown, 
  AlertCircle, 
  Sparkles, 
  Volume2, 
  PhoneCall, 
  AlertTriangle, 
  ShieldAlert,
  Trash2,
  HelpCircle
} from 'lucide-react';
import { consultationApi } from '../../api/endpoints';

const VOICES = [
  { id: 'banmai', name: 'Giọng Nữ Miền Bắc', desc: 'Giọng đọc chuẩn y khoa truyền cảm', engine: 'Y Khoa' },
];

/* ─── Waveform Animation ─── */
function Waveform() {
  return (
    <div className="flex items-end gap-0.5 h-5" aria-hidden>
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          className="w-1 bg-teal-600 rounded-sm animate-bounce"
          style={{ height: `${8 + (i % 3) * 6}px`, animationDelay: `${i * 0.1}s`, animationDuration: '0.6s' }}
        />
      ))}
    </div>
  );
}

/* ─── Inline Audio Player ─── */
function AudioPlayer({ audioUrl, engine }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1.15);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audio.playbackRate = speed;
    audioRef.current = audio;
    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
    audio.addEventListener('durationchange', () => setDuration(audio.duration || 0));
    audio.addEventListener('ended', () => setIsPlaying(false));
    return () => { audio.pause(); audio.src = ''; };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else {
      audio.playbackRate = speed;
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * duration;
  };

  const changeSpeed = (s) => {
    setSpeed(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const pct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="mt-3.5 bg-slate-100/80 border border-slate-200/90 rounded-xl p-3.5 shadow-2xs">
      <div className="flex items-center gap-3">
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="w-9 h-9 bg-teal-800 hover:bg-teal-900 text-white rounded-lg flex items-center justify-center flex-shrink-0 transition-colors shadow-2xs t-btn-press"
          title={isPlaying ? "Tạm dừng" : "Phát âm thanh"}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Waveform khi đang phát */}
        {isPlaying && <Waveform />}

        {/* Progress bar */}
        <div className="flex-1">
          <div
            className="h-1.5 bg-slate-300/80 rounded-full cursor-pointer relative overflow-hidden"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-teal-700 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
            <span>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>

        {/* Speed buttons */}
        <div className="flex gap-1 items-center">
          <span className="text-[11px] text-slate-400 font-semibold mr-0.5 hidden sm:inline">Tốc độ:</span>
          {[1.0, 1.15, 1.25, 1.5].map(s => (
            <button
              key={s}
              onClick={() => changeSpeed(s)}
              className={`text-xs px-2 py-1 rounded-md border font-semibold transition-all duration-150 t-btn-press ${
                speed === s 
                  ? 'bg-teal-800 text-white border-teal-800 shadow-2xs' 
                  : 'bg-white text-slate-600 border-slate-200/90 hover:border-teal-600'
              }`}
              title={`Tốc độ đọc ${s}x`}
            >
              {s}×
            </button>
          ))}
        </div>

        {/* Download */}
        <a
          href={audioUrl}
          download="tu-van-suc-khoe.mp3"
          className="w-8 h-8 border border-slate-200/90 hover:border-teal-600 text-slate-500 hover:text-teal-700 rounded-lg flex items-center justify-center transition-colors bg-white t-btn-press"
          title="Tải tệp âm thanh MP3"
        >
          <Download className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Giọng đọc chuẩn y khoa */}
      <div className="mt-2.5 flex items-center gap-2">
        <span className="text-[10px] bg-teal-50 text-teal-800 px-2 py-0.5 rounded-md font-semibold border border-teal-200/80">
          Giọng đọc: Chuẩn Y Khoa • 100% Thuật ngữ chuẩn
        </span>
      </div>
    </div>
  );
}

/* ─── Chat Message ─── */
function ChatMessage({ msg, onQuickReply }) {
  const isBot = msg.senderType === 'BOT' || msg.role === 'BOT';
  const textContent = msg.rawContent || msg.content || msg.message || '';
  const [showNormalized, setShowNormalized] = useState(false);
  const riskLevel = msg.riskLevel || 'LOW';

  // Trích xuất danh sách Quick-reply tags
  let quickRepliesList = [];
  if (msg.quickReplies) {
    try {
      quickRepliesList = typeof msg.quickReplies === 'string' ? JSON.parse(msg.quickReplies) : msg.quickReplies;
    } catch (e) {
      quickRepliesList = typeof msg.quickReplies === 'string' 
        ? msg.quickReplies.split('|').map(s => s.trim()).filter(Boolean)
        : [];
    }
  }

  if (!isBot) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-xs lg:max-w-md bg-teal-850 bg-teal-800 text-white rounded-2xl rounded-tr-sm px-4.5 py-3 shadow-xs">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{textContent}</p>
          <p className="text-[10px] text-teal-200/80 mt-1.5 text-right font-mono">
            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
          </p>
        </div>
      </div>
    );
  }

  const hasPhonetic = msg.normalizedContent && msg.normalizedContent !== textContent;

  // Cấu hình viền & nền theo cấp độ rủi ro y tế (Medical Triage Engine)
  const getRiskContainerClasses = () => {
    switch (riskLevel) {
      case 'EMERGENCY':
        return 'border-rose-400 bg-rose-50/90 shadow-md ring-1 ring-rose-300';
      case 'HIGH':
        return 'border-amber-400 bg-amber-50/80 shadow-xs ring-1 ring-amber-200';
      case 'MEDIUM':
        return 'border-sky-400 bg-sky-50/80 shadow-xs ring-1 ring-sky-200';
      case 'LOW':
      default:
        return 'border-teal-300 bg-teal-50/70 shadow-xs';
    }
  };

  // Render Huy hiệu & Cảnh báo theo rủi ro y tế
  const renderRiskBanner = () => {
    switch (riskLevel) {
      case 'EMERGENCY':
        return (
          <div className="mb-3.5 p-3 rounded-xl bg-rose-100/90 border border-rose-300 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-rose-950 font-bold text-xs">
              <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 animate-pulse" />
              <div>
                <span className="block uppercase tracking-wider text-[11px] font-extrabold text-rose-700">CẤP CỨU KHẨN CẤP</span>
                <span className="text-[11px] font-normal text-rose-900">Cần can thiệp y tế ngay lập tức trong thời gian vàng</span>
              </div>
            </div>
            <a
              href="tel:115"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg shadow-xs transition t-btn-press"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>GỌI CẤP CỨU 115</span>
            </a>
          </div>
        );
      case 'HIGH':
        return (
          <div className="mb-3 p-2.5 rounded-xl bg-amber-100/80 border border-amber-300 flex items-center gap-2 text-amber-950 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span className="uppercase tracking-wider text-[11px]">NGUY CƠ CAO - CẦN ĐI KHÁM TRONG 24H</span>
          </div>
        );
      case 'MEDIUM':
        return (
          <div className="mb-3 p-2.5 rounded-xl bg-sky-100/80 border border-sky-300 flex items-center gap-2 text-sky-950 font-semibold text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block"></span>
            <span className="uppercase tracking-wider text-[11px]">THEO DÕI SÁT TẠI NHÀ &amp; NGHỈ NGƠI</span>
          </div>
        );
      case 'LOW':
      default:
        return (
          <div className="mb-3 p-2.5 rounded-xl bg-teal-100/80 border border-teal-300/80 flex items-center gap-2 text-teal-950 font-semibold text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-700 inline-block"></span>
            <span className="uppercase tracking-wider text-[11px]">THEO DÕI VÀ CHĂM SÓC TẠI NHÀ</span>
          </div>
        );
    }
  };

  return (
    <div className="flex justify-start mb-4">
      <div className={`max-w-sm lg:max-w-xl border rounded-2xl rounded-tl-sm px-4.5 py-4 transition-colors ${getRiskContainerClasses()}`}>
        {/* Header thông tin trợ lý & luật phân loại */}
        <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-slate-200/60">
          <div className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] text-white ${
            riskLevel === 'EMERGENCY' ? 'bg-rose-600' :
            riskLevel === 'HIGH' ? 'bg-amber-600' :
            riskLevel === 'MEDIUM' ? 'bg-sky-700' : 'bg-teal-800'
          }`}>
            AI
          </div>
          <span className="text-xs font-bold text-slate-900">Trợ Lý Sức Khỏe AI</span>

          {/* Engine Badge */}
          {riskLevel === 'EMERGENCY' ? (
            <span className="text-[10px] bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-md font-bold ml-auto flex items-center gap-1 shadow-2xs">
              <ShieldAlert className="w-2.5 h-2.5 text-rose-600 animate-pulse" />
              <span>Cây Quyết Định 115</span>
            </span>
          ) : (
            <span className="text-[10px] bg-sky-50 text-sky-800 border border-sky-300 px-2 py-0.5 rounded-md font-bold ml-auto flex items-center gap-1 shadow-2xs">
              <Sparkles className="w-2.5 h-2.5 text-sky-600" />
              <span>Gemini LLM Engine</span>
            </span>
          )}

          {msg.isCached && (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded-md font-semibold ml-1">
              Audio Cache HIT
            </span>
          )}
        </div>

        {/* Huy hiệu & Cảnh báo phân loại rủi ro y tế */}
        {renderRiskBanner()}

        <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{textContent}</p>

        {/* Đối chiếu chuẩn hóa ngữ âm y khoa */}
        {hasPhonetic && (
          <div className="mt-3 pt-2.5 border-t border-slate-200/60">
            <button
              onClick={() => setShowNormalized(prev => !prev)}
              className="text-xs text-teal-800 hover:text-teal-900 font-semibold flex items-center gap-1 transition t-btn-press"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{showNormalized ? 'Ẩn phiên âm y khoa' : 'Xem văn bản đã chuẩn hóa âm đọc'}</span>
            </button>
            {showNormalized && (
              <div className="mt-2 p-3 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-700 font-mono leading-relaxed">
                <span className="font-semibold text-slate-500 block mb-1 text-[10px] uppercase">Phiên âm chuẩn y khoa:</span>
                {msg.normalizedContent}
              </div>
            )}
          </div>
        )}

        {/* Trình phát âm thanh tích hợp */}
        {msg.audioUrl && (
          <AudioPlayer audioUrl={msg.audioUrl} engine={msg.voiceCode || 'Giọng Đọc Y Khoa'} />
        )}

        {/* ============================================================= */}
        {/* TẦNG 3: QUICK-REPLY TAGS (GỢI Ý CÂU HỎI ĐÀO SÂU LÂM SÀNG)    */}
        {/* ============================================================= */}
        {quickRepliesList.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-slate-200/60">
            <p className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-teal-700" />
              <span>Gợi ý câu hỏi đào sâu lâm sàng:</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {quickRepliesList.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onQuickReply?.(tag)}
                  className="text-xs bg-white hover:bg-teal-50 hover:text-teal-950 text-teal-800 border border-teal-200 hover:border-teal-500 px-3 py-1.5 rounded-full font-medium transition shadow-2xs flex items-center gap-1.5 text-left cursor-pointer t-btn-press"
                >
                  <span className="text-teal-600 font-bold">💬</span>
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-200/60">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <span>
              {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
            {msg.latencyMs > 0 && (
              <span>• {msg.latencyMs}ms</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── New Session Modal ─── */
function NewSessionModal({ onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onCreate(title.trim());
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-900 text-sm">Khởi tạo phiên tư vấn mới</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
        </div>
        <div className="px-5 py-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            Tiêu đề phiên tư vấn
          </label>
          <input
            type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="VD: Kiểm tra huyết áp tại nhà, Tư vấn sốt cao..."
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
        </div>
        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-md text-sm text-slate-600 hover:bg-slate-100">
            Hủy
          </button>
          <button
            onClick={handleCreate} disabled={loading || !title.trim()}
            className="px-4 py-2 bg-teal-800 hover:bg-teal-700 disabled:opacity-50 text-white rounded-md text-sm font-semibold transition"
          >
            {loading ? 'Đang tạo...' : 'Tạo phiên'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function PatientDashboard() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showNewSession, setShowNewSession] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const handleQuickReply = (question) => {
    setInputText(question);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await consultationApi.getSessions();
      const list = Array.isArray(res) ? res : (res?.data || res?.sessions || res?.content || []);
      setSessions(list);
      if (list.length > 0 && !activeSession) {
        setActiveSession(list[0]);
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách phiên:', err);
      setError('Không thể tải danh sách phiên tư vấn.');
    } finally {
      setLoading(false);
    }
  }, [activeSession]);

  useEffect(() => { fetchSessions(); }, []);

  // Fetch messages khi đổi session
  useEffect(() => {
    if (!activeSession?.id) return;
    const fetchMessages = async () => {
      try {
        const res = await consultationApi.getMessages(activeSession.id);
        const list = Array.isArray(res) ? res : (res?.data || res?.messages || []);
        setMessages(list);
      } catch (err) {
        console.warn('Lỗi tải tin nhắn:', err);
        setMessages([]);
      }
    };
    fetchMessages();
  }, [activeSession]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCreateSession = async (title) => {
    try {
      const res = await consultationApi.createSession({ title, voiceId: selectedVoice.id });
      const created = res?.data || res;
      await fetchSessions();
      if (created && created.id) {
        setActiveSession(created);
      }
      setMessages([]);
    } catch (err) {
      console.error('Lỗi khởi tạo phiên:', err);
      setError('Không thể khởi tạo phiên tư vấn mới.');
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !activeSession || sending) return;
    const text = inputText.trim();
    setInputText('');
    setSending(true);

    // Optimistic UI
    const tempMsg = {
      id: `temp-${Date.now()}`,
      rawContent: text,
      senderType: 'PATIENT',
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const response = await consultationApi.sendMessage({
        sessionId: activeSession.id,
        symptomText: text,
        voiceCode: selectedVoice.id,
      });

      const payload = response?.data || response;
      const botMsg = payload?.botReply || payload?.botMessage;
      const patMsg = payload?.patientMessage;

      if (botMsg) {
        if (!botMsg.riskLevel && payload?.riskLevel) botMsg.riskLevel = payload.riskLevel;
        if (!botMsg.ruleCode && payload?.ruleCode) botMsg.ruleCode = payload.ruleCode;
      }

      setMessages(prev => [
        ...prev.filter(m => m.id !== tempMsg.id),
        patMsg || tempMsg,
        ...(botMsg ? [botMsg] : []),
      ]);
    } catch (err) {
      console.error('Lỗi gửi triệu chứng:', err);
      // Tự động kiểm tra xem server đã xử lý và lưu tin nhắn hội thoại thành công hay chưa
      try {
        const msgsRes = await consultationApi.getMessages(activeSession.id);
        const latestMsgs = msgsRes?.data || msgsRes;
        if (Array.isArray(latestMsgs) && latestMsgs.length > 0) {
          const hasUserMsg = latestMsgs.some(m => m.rawContent === text);
          if (hasUserMsg) {
            setMessages(latestMsgs);
            setError('');
            return;
          }
        }
      } catch (recoverErr) {
        // bỏ qua lỗi phục hồi
      }
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      const msg = err.response?.data?.message || err.message || 'Vui lòng kiểm tra kết nối dịch vụ.';
      setError(`Gửi câu hỏi thất bại: ${msg}`);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteSession = async (sessionId, sessionTitle, e) => {
    if (e) e.stopPropagation();
    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn đoạn hội thoại "${sessionTitle || `Phiên #${sessionId}`}" không?`);
    if (!confirmed) return;

    try {
      await consultationApi.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSession?.id === sessionId) {
        const remaining = sessions.filter(s => s.id !== sessionId);
        setActiveSession(remaining.length > 0 ? remaining[0] : null);
        if (remaining.length === 0) setMessages([]);
      }
      setError('');
    } catch (err) {
      console.warn('Lỗi xóa đoạn hội thoại:', err);
      // Nếu phiên đã bị xóa từ trước hoặc không thuộc quyền (404, 400, 403), tự động dọn khỏi danh sách UI
      if (err?.response?.status === 404 || err?.response?.status === 400 || err?.response?.status === 403) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (activeSession?.id === sessionId) {
          const remaining = sessions.filter(s => s.id !== sessionId);
          setActiveSession(remaining.length > 0 ? remaining[0] : null);
          if (remaining.length === 0) setMessages([]);
        }
        setError('');
      } else {
        const msg = err?.response?.data?.message || 'Không thể xóa đoạn hội thoại. Vui lòng thử lại.';
        setError(msg);
      }
    }
  };

  const statusBadge = (status) => {
    if (status === 'ACTIVE') return <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-semibold">Đang hoạt động</span>;
    return <span className="text-[11px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded font-semibold">Đã đóng</span>;
  };

  return (
    <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
      {/* ── LEFT PANEL ── */}
      <aside className="w-80 bg-white border-r border-slate-200/90 flex flex-col flex-shrink-0">
        {/* New Session */}
        <div className="p-4 border-b border-slate-200/90">
          <button
            onClick={() => setShowNewSession(true)}
            className="w-full flex items-center justify-center gap-2 bg-teal-800 hover:bg-teal-900 text-white text-sm font-semibold py-2.5 rounded-xl transition-all shadow-xs t-btn-press"
          >
            <Plus className="w-4 h-4" /> Phiên tư vấn mới
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-4 pb-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phiên tư vấn của tôi</p>
          </div>
          {loading && <div className="px-4 py-6 text-sm text-slate-400 text-center font-medium">Đang tải...</div>}
          {!loading && sessions.length === 0 && (
            <div className="px-4 py-8 text-sm text-slate-400 text-center leading-relaxed">
              Chưa có phiên tư vấn nào.<br />Nhấn vào nút phía trên để bắt đầu.
            </div>
          )}
          {sessions.map(session => (
            <div
              key={session.id}
              onClick={() => { setActiveSession(session); setError(''); }}
              className={`group w-full text-left px-4 py-3.5 border-b border-slate-100/90 hover:bg-slate-50/80 transition-all cursor-pointer ${
                activeSession?.id === session.id 
                  ? 'bg-teal-50/70 border-l-4 border-l-teal-800' 
                  : 'border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className={`text-sm truncate ${activeSession?.id === session.id ? 'font-bold text-teal-950' : 'font-semibold text-slate-800'}`}>
                    {session.title || `Phiên #${session.id}`}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    {session.createdAt ? new Date(session.createdAt).toLocaleDateString('vi-VN') : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleDeleteSession(session.id, session.title, e)}
                    title="Xóa đoạn hội thoại"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition t-btn-press"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-1.5">{statusBadge(session.status)}</div>
            </div>
          ))}
        </div>

        {/* Voice Info */}
        <div className="border-t border-slate-200/90 p-3.5 bg-slate-50/70">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5 text-teal-800" /> Giọng đọc tư vấn y khoa
          </p>
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-teal-200/80 bg-teal-50/80 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              YK
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-teal-950">Giọng Nữ Chuẩn</span>
                <span className="text-[9px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-semibold border border-teal-200">Y Khoa</span>
              </div>
              <p className="text-[11px] text-teal-700 truncate mt-0.5">Truyền cảm, chuẩn phiên âm y tế</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Đang sẵn sàng" />
          </div>
        </div>
      </aside>

      {/* ── RIGHT PANEL (Chat) ── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-100/40">
        {!activeSession ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 p-8">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
                <MessageSquare className="w-8 h-8 text-teal-800 opacity-60" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Bắt đầu phiên tư vấn sức khỏe</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Chọn một phiên hội thoại từ danh sách bên trái hoặc tạo phiên mới để nhận phản hồi và giọng đọc chuẩn hóa y khoa.
              </p>
              <button
                onClick={() => setShowNewSession(true)}
                className="inline-flex items-center gap-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold px-4.5 py-2.5 rounded-xl transition shadow-xs t-btn-press"
              >
                <Plus className="w-3.5 h-3.5" /> Tạo phiên mới ngay
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-slate-200/90 px-6 py-3.5 flex items-center justify-between flex-shrink-0 shadow-2xs">
              <div>
                <h2 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">{activeSession.title || `Phiên #${activeSession.id}`}</h2>
                <div className="flex items-center gap-2.5 mt-0.5">
                  {statusBadge(activeSession.status)}
                  <span className="text-xs text-slate-500">Giọng đọc: <strong className="text-slate-800 font-semibold">Chuẩn Y Khoa</strong></span>
                </div>
              </div>

              {/* Nút xóa đoạn hội thoại */}
              <button
                type="button"
                onClick={() => handleDeleteSession(activeSession.id, activeSession.title)}
                title="Xóa vĩnh viễn đoạn hội thoại này"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-800 border border-rose-200 rounded-lg transition shadow-2xs t-btn-press"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa đoạn hội thoại</span>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {error && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 mb-4 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                </div>
              )}
              {messages.length === 0 && (
                <div className="text-center py-20 text-slate-400 max-w-md mx-auto">
                  <p className="text-sm font-bold text-slate-700 mb-1">Phiên tư vấn sẵn sàng</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Hãy nhập các chỉ số lâm sàng (như "Huyết áp 140/90 mmHg, SpO2 96%, nhịp tim 82 bpm") hoặc triệu chứng của bạn để nhận lời khuyên y tế và nghe giọng đọc tự nhiên.
                  </p>
                </div>
              )}
              {messages.map(msg => (
                <ChatMessage 
                  key={msg.id} 
                  msg={msg} 
                  onQuickReply={handleQuickReply} 
                />
              ))}
              {sending && (
                <div className="flex justify-start mb-4">
                  <div className="bg-white border border-slate-200/90 rounded-2xl px-4 py-3 shadow-xs">
                    <div className="flex items-center gap-2.5 text-slate-600 text-xs font-medium">
                      <svg className="animate-spin w-4 h-4 text-teal-800" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Đang phân tích lâm sàng &amp; tổng hợp âm thanh y khoa...
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-slate-200/90 px-6 py-4 flex-shrink-0">
              <div className="flex gap-3">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Mô tả triệu chứng hoặc chỉ số sức khỏe của bạn (ví dụ: Huyết áp của tôi hôm nay 140/90 mmHg, SpO2 96%...)"
                  rows={2}
                  disabled={activeSession?.status === 'CLOSED' || sending}
                  className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 resize-none disabled:bg-slate-50 disabled:text-slate-400 leading-relaxed transition"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || sending || activeSession?.status === 'CLOSED'}
                  className="self-end bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm font-semibold shadow-xs t-btn-press"
                >
                  {sending ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : <Send className="w-4 h-4" />}
                  Gửi
                </button>
              </div>
              {activeSession?.status === 'CLOSED' && (
                <p className="text-xs text-rose-600 mt-2 font-medium">Phiên này đã đóng. Vui lòng tạo phiên mới để tiếp tục.</p>
              )}
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      {showNewSession && (
        <NewSessionModal
          onClose={() => setShowNewSession(false)}
          onCreate={handleCreateSession}
        />
      )}
    </div>
  );
}
