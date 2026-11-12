import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Star, 
  Stethoscope, 
  Tag, 
  Download, 
  Share2, 
  CheckCircle2, 
  Clock, 
  Volume2, 
  Check, 
  ArrowRight,
  BookOpen,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAudioPlayer } from '../../context/AudioContext';
import axiosClient from '../../api/axiosClient';

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const AudioDetailModal = () => {
  const {
    activeModalTrack,
    closeDetailModal,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    playTrack,
    seek,
    skip,
  } = useAudioPlayer();

  const [copied, setCopied] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);

  if (!activeModalTrack) return null;

  const isCurrentActive = currentTrack?.id === activeModalTrack.id;
  const trackIsPlaying = isCurrentActive && isPlaying;

  // Mock sample transcript data if not provided
  const transcriptSections = activeModalTrack.transcriptSections || [
    {
      time: 0,
      timestamp: '00:00',
      heading: 'Chào hỏi & Đặt vấn đề lâm sàng',
      content: `Kính chào quý vị và các bạn, tôi là ${activeModalTrack.doctorName || 'Bác sĩ chuyên khoa'}. Trong bản tin y tế hôm nay, chúng ta cùng trao đổi về giải pháp phòng ngừa và xử trí ban đầu đối với bệnh lý ${activeModalTrack.category || 'Tim mạch'}.`,
    },
    {
      time: 35,
      timestamp: '00:35',
      heading: 'Nhận biết dấu hiệu sinh tồn bất thường',
      content: `Khi kiểm tra tại nhà, nếu ghi nhận chỉ số HA 140/90 mmHg hoặc kèm theo SpO2 giảm dưới 95%, người bệnh cần ngồi nghỉ tĩnh tại chỗ thoáng khí trong vòng 15 phút. Tuyệt đối không tự ý dùng thêm thuốc hạ áp khẩn cấp khi chưa có chỉ định.`,
    },
    {
      time: 80,
      timestamp: '01:20',
      heading: 'Hướng dẫn sử dụng thuốc an toàn',
      content: `Trong trường hợp xuất hiện triệu chứng đau nhức đầu kèm sốt trên 38.5 độ C, quý vị có thể dùng Paracetamol 500mg 1 viên sau ăn, khoảng cách giữa 2 lần uống tối thiểu 4 đến 6 giờ. Nếu sau 30 phút huyết áp vẫn dao động trên 150/95 mmHg, hãy liên hệ ngay cơ sở y tế gần nhất.`,
    },
    {
      time: 140,
      timestamp: '02:20',
      heading: 'Lời khuyên dinh dưỡng & Lối sống',
      content: `Quý vị chú ý duy trì chế độ ăn giảm muối, hạn chế thực phẩm chế biến sẵn và bổ sung rau xanh. Chúc quý vị và gia đình luôn có một trái tim khỏe mạnh!`,
    }
  ];

  // Normalized terms breakdown
  const termsList = activeModalTrack.normalizedTerms || [
    {
      from: 'HA 140/90 mmHg',
      to: 'Huyết áp một trăm bốn mươi trên chín mươi mi-li-mét thủy ngân',
      desc: 'Chuẩn hóa chỉ số huyết áp tâm thu và tâm trương theo âm vị tiếng Việt, tránh phát âm rời rạc từng số.',
    },
    {
      from: 'SpO2 95%',
      to: 'Ét-pê-ô-hai chín mươi lăm phần trăm',
      desc: 'Phiên âm độ bão hòa oxy trong máu ngoại vi chuẩn quốc tế.',
    },
    {
      from: 'Paracetamol 500mg 1v',
      to: 'Pa-ra-xê-ta-mol năm trăm mi-li-gam một viên',
      desc: 'Phiên âm biệt dược và quy đổi dạng đơn vị 1v thành một viên.',
    },
    {
      from: '> 38.5 độ C',
      to: 'trên ba mươi tám phẩy năm độ C',
      desc: 'Chuyển đổi dấu so sánh và số thập phân thành văn bản ngữ âm mượt mà.',
    }
  ];

  const handleStartPlay = () => {
    if (isCurrentActive) {
      togglePlay();
    } else {
      playTrack(activeModalTrack);
    }
  };

  const handleSeekSection = (seconds) => {
    if (!isCurrentActive) {
      playTrack(activeModalTrack);
    }
    setTimeout(() => {
      seek(seconds);
    }, 100);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl border border-slate-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-teal-800 flex items-center justify-center text-teal-200">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-teal-900/80 text-teal-300 border border-teal-700 text-[11px] font-semibold">
                  {activeModalTrack.category || 'Tư Vấn Y Khoa'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1 line-clamp-1">
                {activeModalTrack.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={closeDetailModal}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Player Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleStartPlay}
              className="w-10 h-10 rounded-md bg-teal-800 hover:bg-teal-900 text-white flex items-center justify-center transition"
            >
              {trackIsPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
            </button>
            <div>
              <p className="text-xs font-bold text-slate-900">{activeModalTrack.doctorName || 'BS. Chuyên Khoa'}</p>
              <p className="text-[11px] text-slate-500">{activeModalTrack.voiceInfo || 'VoiceStudio Giọng Đọc Y Tế'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 hover:bg-white text-xs font-semibold text-slate-700 transition"
            >
              {copied ? <Check className="w-4 h-4 text-teal-700" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Đã sao chép' : 'Chia sẻ'}
            </button>

            <a
              href={activeModalTrack.audioUrl}
              download={`${activeModalTrack.title}.mp3`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold transition"
            >
              <Download className="w-4 h-4" />
              Tải file MP3
            </a>
          </div>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Full Synced Transcript (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-800" />
                Văn Bản Tư Vấn & Phiên Âm Ngữ Đồng Bộ
              </h3>
              <span className="text-[11px] text-slate-500 italic">Bấm vào thời gian để nghe trực tiếp</span>
            </div>

            <div className="space-y-3">
              {transcriptSections.map((sec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-md border border-slate-200 hover:border-teal-400 hover:bg-teal-50/20 transition group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-teal-900">{sec.heading}</span>
                    <button
                      type="button"
                      onClick={() => handleSeekSection(sec.time)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-teal-800 hover:text-white text-[11px] font-mono font-semibold text-slate-600 transition"
                      title="Phát từ mốc này"
                    >
                      <Play className="w-3 h-3" />
                      {sec.timestamp}
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    {sec.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Medical Phonetic Breakdown & MOS Rating (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Thuật ngữ y khoa đã chuẩn hóa */}
            <div className="bg-slate-50 rounded-md p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-teal-800" />
                  Đối Chiếu Thuật Ngữ Y Khoa
                </h4>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded-md">
                  {termsList.length} từ khóa
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-normal">
                Hệ thống tự động phát hiện ký hiệu viết tắt y khoa và chuẩn hóa sang âm điệu tiếng Việt tự nhiên:
              </p>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {termsList.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedTerm(item)}
                    className="p-2.5 bg-white rounded-md border border-slate-200 hover:border-teal-400 cursor-pointer transition text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-rose-600">{item.from}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-teal-800 text-right truncate max-w-[180px]">{item.to}</span>
                    </div>
                    {item.desc && (
                      <p className="text-[10px] text-slate-500 italic line-clamp-1">{item.desc}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioDetailModal;
