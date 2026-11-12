import React, { useState, useEffect, useRef } from 'react';
import { Bell, Pill, CheckCircle2, Clock, Volume2, VolumeX, Sparkles, AlertTriangle, X } from 'lucide-react';

/**
 * Waveform Animation hiển thị khi âm thanh FPT.AI đang phát
 */
function AlarmWaveform() {
  return (
    <div className="flex items-end gap-1 h-6" aria-hidden>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="w-1.5 bg-teal-600 rounded-full animate-bounce"
          style={{
            height: `${10 + (i % 3) * 7}px`,
            animationDelay: `${i * 0.12}s`,
            animationDuration: '0.6s',
          }}
        />
      ))}
    </div>
  );
}

export default function MedicationAlarmModal({ reminder, onConfirmTaken, onSnooze, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!reminder?.audioUrl) return;

    const audio = new Audio(reminder.audioUrl);
    audioRef.current = audio;

    audio.addEventListener('ended', () => setIsPlaying(false));
    audio.addEventListener('error', (e) => {
      console.warn('Lỗi phát âm thanh nhắc thuốc:', e);
      setIsPlaying(false);
    });

    // Thử tự động phát âm thanh
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch((err) => {
          console.warn('Trình duyệt chặn Autoplay âm thanh:', err);
          // Trình duyệt chặn autoplay do chính sách tương tác người dùng
          setAutoplayBlocked(true);
          setIsPlaying(false);
        });
    }

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [reminder]);

  const handleManualPlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch(console.error);
    }
  };

  if (!reminder) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border-2 border-teal-600 overflow-hidden ring-4 ring-teal-500/20">
        
        {/* Header Cảnh Báo Nổi Bật */}
        <div className="bg-gradient-to-r from-teal-800 to-teal-700 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-teal-200 shadow-inner animate-pulse">
              <Bell className="w-6 h-6 text-amber-300 animate-bounce" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-teal-200 block">
                BÁO GIỜ UỐNG THUỐC ĐỊNH KỲ
              </span>
              <h2 className="text-xl font-black tracking-tight text-white">
                ĐÃ ĐẾN GIỜ UỐNG THUỐC!
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-teal-200 hover:text-white p-1 rounded-lg transition"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thân Cảnh Báo */}
        <div className="p-6 space-y-5">
          {/* Box Chi tiết giờ & thuốc */}
          <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1.5">
                <Pill className="w-4 h-4" /> Tên thuốc cần uống:
              </span>
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {reminder.medicineName}
              </h3>
              <p className="text-sm font-semibold text-teal-900">
                Liều lượng: <span className="text-slate-800 font-normal">{reminder.dosage}</span>
              </p>
            </div>
            <div className="text-right flex-shrink-0 bg-white border border-teal-200 rounded-lg p-2.5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Giờ hẹn</span>
              <span className="text-2xl font-black text-teal-800 font-mono tracking-tight">
                {typeof reminder.reminderTime === 'string' ? reminder.reminderTime.substring(0, 5) : '08:00'}
              </span>
            </div>
          </div>

          {/* Lời dặn bổ sung */}
          {reminder.note && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-600 block mb-0.5">Lời dặn của Bác sĩ / Ghi chú:</span>
              {reminder.note}
            </div>
          )}

          {/* Thanh hiển thị phát giọng đọc y tế */}
          <div className="bg-slate-100 rounded-xl p-3.5 border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleManualPlay}
                className="w-10 h-10 rounded-lg bg-teal-800 hover:bg-teal-700 text-white flex items-center justify-center shadow-xs transition"
                title={isPlaying ? "Tạm dừng" : "Phát lại giọng đọc"}
              >
                {isPlaying ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <div>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                  <span>Giọng đọc y tế nhắc dặn</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  {isPlaying ? 'Đang phát âm thanh lời dặn...' : 'Nhấn biểu tượng loa để nghe lại'}
                </p>
              </div>
            </div>
            {isPlaying && <AlarmWaveform />}
          </div>

          {/* Cảnh báo khi trình duyệt chặn Autoplay */}
          {autoplayBlocked && !isPlaying && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-center justify-between gap-2 text-amber-900 text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Trình duyệt yêu cầu bạn chạm để phát âm thanh:</span>
              </div>
              <button
                onClick={handleManualPlay}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-md transition text-xs flex-shrink-0"
              >
                Bật tiếng ngay
              </button>
            </div>
          )}
        </div>

        {/* 2 Nút hành động chính */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onSnooze}
            className="w-full sm:w-1/2 px-4 py-3 border border-slate-300 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-100 transition flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Nhắc lại sau 5 phút</span>
          </button>

          <button
            type="button"
            onClick={onConfirmTaken}
            className="w-full sm:w-1/2 px-5 py-3 bg-teal-800 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5 text-teal-200" />
            <span>Đã uống thuốc</span>
          </button>
        </div>

      </div>
    </div>
  );
}

